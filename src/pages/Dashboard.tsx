import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const DOCS_URL = 'https://functions.poehali.dev/a162045b-1dc7-427a-993e-a64cf9d0ae3b';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  department?: string;
  role: string;
}

interface Document {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
  description?: string;
  user_name?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    profileVisibility: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDocuments();
  }, [navigate]);

  const loadDocuments = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(DOCS_URL, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл для загрузки',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('auth_token');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1];

        const response = await fetch(DOCS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token!,
          },
          body: JSON.stringify({
            file_name: uploadFile.name,
            file_data: base64,
            file_type: uploadFile.type,
            description: '',
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: 'Успешно',
            description: 'Документ загружен',
          });
          setUploadFile(null);
          loadDocuments();
        } else {
          toast({
            title: 'Ошибка',
            description: data.error || 'Не удалось загрузить документ',
            variant: 'destructive',
          });
        }
        setLoading(false);
      };

      reader.readAsDataURL(uploadFile);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSettingsChange = (field: string, value: boolean) => {
    setSettings({ ...settings, [field]: value });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const activityData = [
    { label: 'Активность профиля', value: 85 },
    { label: 'Завершённые задачи', value: 72 },
    { label: 'Использование хранилища', value: 45 },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={user.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{user.full_name}</h1>
                <p className="text-sm text-muted-foreground">{user.position || user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
            <TabsTrigger value="documents" className="gap-2">
              <Icon name="FileText" size={16} />
              Документы
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={16} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Активность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Загрузка документов</CardTitle>
                <CardDescription>Загрузите новые файлы в систему</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="file">Выберите файл</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleFileUpload} disabled={loading || !uploadFile}>
                    {loading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={16} className="mr-2" />
                        Загрузить
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Мои документы</CardTitle>
                <CardDescription>Список загруженных файлов</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Документы не найдены
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Размер</TableHead>
                        <TableHead>Дата</TableHead>
                        {user.role === 'admin' && <TableHead>Пользователь</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Icon name="FileText" size={16} className="text-muted-foreground" />
                              {doc.file_name}
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>
                            {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                          </TableCell>
                          {user.role === 'admin' && (
                            <TableCell>
                              <Badge variant="secondary">{doc.user_name || 'N/A'}</Badge>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                  Основные данные вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Полное имя</Label>
                    <Input value={user.full_name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input value={user.phone || 'Не указан'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Должность</Label>
                    <Input value={user.position || 'Не указана'} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Роль</Label>
                    <div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>
                  Настройка способов получения уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления на почту
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать SMS на телефон
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('smsNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>
                  Управление параметрами безопасности аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">
                      Дополнительная защита аккаунта
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingsChange('twoFactorAuth', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика использования</CardTitle>
                <CardDescription>
                  Обзор вашей активности в системе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activityData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon name="FileText" size={20} className="text-accent" />
                    </div>
                    <CardTitle className="text-base">Документов</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">{documents.length}</p>
                  <p className="text-sm text-muted-foreground">Всего загружено</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="CheckCircle2" size={20} className="text-primary" />
                    </div>
                    <CardTitle className="text-base">Задач выполнено</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">247</p>
                  <p className="text-sm text-muted-foreground">За всё время</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon name="Clock" size={20} className="text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Время в системе</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">127ч</p>
                  <p className="text-sm text-muted-foreground">В этом месяце</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
