import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [profile, setProfile] = useState({
    fullName: 'Александр Петров',
    email: 'a.petrov@company.com',
    phone: '+7 (999) 123-45-67',
    position: 'Старший менеджер',
    department: 'Отдел продаж',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    profileVisibility: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSettingsChange = (field: string, value: boolean) => {
    setSettings({ ...settings, [field]: value });
  };

  const activityData = [
    { label: 'Активность профиля', value: 85, color: 'bg-accent' },
    { label: 'Завершённые задачи', value: 72, color: 'bg-primary' },
    { label: 'Использование хранилища', value: 45, color: 'bg-muted-foreground' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={profile.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {profile.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{profile.fullName}</h1>
                <p className="text-sm text-muted-foreground">{profile.position}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
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

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                  Управление основными данными вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Полное имя</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      placeholder="Введите ФИО"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => handleProfileChange('position', e.target.value)}
                      placeholder="Ваша должность"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="department">Отдел</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => handleProfileChange('department', e.target.value)}
                      placeholder="Название отдела"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Отменить</Button>
                  <Button>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить изменения
                  </Button>
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
                <Separator />
                <div className="space-y-3">
                  <Label>Изменить пароль</Label>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Текущий пароль" />
                    <Input type="password" placeholder="Новый пароль" />
                    <Input type="password" placeholder="Повторите новый пароль" />
                  </div>
                  <Button variant="outline" className="w-full md:w-auto">
                    Обновить пароль
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Приватность</CardTitle>
                <CardDescription>
                  Управление видимостью профиля
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Публичный профиль</Label>
                    <p className="text-sm text-muted-foreground">
                      Профиль виден другим пользователям
                    </p>
                  </div>
                  <Switch
                    checked={settings.profileVisibility}
                    onCheckedChange={(checked) => handleSettingsChange('profileVisibility', checked)}
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
                      <Icon name="Calendar" size={20} className="text-accent" />
                    </div>
                    <CardTitle className="text-base">Последний вход</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">28 окт</p>
                  <p className="text-sm text-muted-foreground">14:32</p>
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

export default Index;
