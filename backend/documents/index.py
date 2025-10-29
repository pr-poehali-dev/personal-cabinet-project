'''
Business: Document management - upload, list, delete documents
Args: event with httpMethod, body (file data), headers (X-Auth-Token)
Returns: HTTP response with document info or list
'''

import json
import os
import base64
import uuid
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt

def verify_token(token: str, jwt_secret: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return {'valid': True, 'user_id': payload['user_id'], 'role': payload['role']}
    except:
        return {'valid': False}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET')
    
    if not db_url or not jwt_secret:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Server configuration error'})
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    auth = verify_token(token, jwt_secret)
    if not auth['valid']:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            
            if auth['role'] == 'admin' and user_id:
                cursor.execute(
                    "SELECT d.*, u.full_name as user_name FROM documents d JOIN users u ON d.user_id = u.id WHERE d.user_id = %s ORDER BY d.uploaded_at DESC",
                    (user_id,)
                )
            elif auth['role'] == 'admin':
                cursor.execute(
                    "SELECT d.*, u.full_name as user_name FROM documents d JOIN users u ON d.user_id = u.id ORDER BY d.uploaded_at DESC"
                )
            else:
                cursor.execute(
                    "SELECT * FROM documents WHERE user_id = %s ORDER BY uploaded_at DESC",
                    (auth['user_id'],)
                )
            
            documents = cursor.fetchall()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'documents': [dict(doc) for doc in documents]}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            file_name = body.get('file_name')
            file_data = body.get('file_data')
            file_type = body.get('file_type')
            description = body.get('description', '')
            
            if not file_name or not file_data:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'file_name and file_data required'})
                }
            
            file_size = len(file_data)
            file_url = f"data:{file_type};base64,{file_data}"
            
            cursor.execute(
                "INSERT INTO documents (user_id, file_name, file_size, file_type, file_url, description) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, file_name, file_size, file_type, uploaded_at",
                (auth['user_id'], file_name, file_size, file_type, file_url, description)
            )
            document = cursor.fetchone()
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'document': dict(document)}, default=str)
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            doc_id = query_params.get('id')
            
            if not doc_id:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Document id required'})
                }
            
            if auth['role'] == 'admin':
                cursor.execute("SELECT id FROM documents WHERE id = %s", (doc_id,))
            else:
                cursor.execute("SELECT id FROM documents WHERE id = %s AND user_id = %s", (doc_id, auth['user_id']))
            
            doc = cursor.fetchone()
            
            if not doc:
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Document not found'})
                }
            
            cursor.execute("UPDATE documents SET file_url = '', description = 'Deleted' WHERE id = %s", (doc_id,))
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
