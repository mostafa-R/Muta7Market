import { Alert, AlertDescription, AlertTitle } from '@/app/component/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/component/ui/card';
import { fetchAnalyticsData, fetchRealTimeAnalytics } from '@/lib/analytics';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CountryChart from './CountryChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);

  // جلب بيانات التحليلات عند تغيير نطاق الوقت
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAnalyticsData(timeRange);
        setAnalyticsData(data);
      } catch (err) {
        // Error loading analytics data
        setError('حدث خطأ أثناء جلب بيانات التحليلات. يرجى التحقق من اتصالك بالإنترنت أو إعدادات Google Analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);
  
  // جلب بيانات الوقت الحقيقي عند تحميل المكون
  useEffect(() => {
    const loadRealTimeData = async () => {
      try {
        const rtData = await fetchRealTimeAnalytics();
        setRealTimeData(rtData);
      } catch (err) {
        // Error loading real-time data
      }
    };
    
    loadRealTimeData();
  }, []);

  // تحديث بيانات الوقت الحقيقي كل دقيقة
  useEffect(() => {
    const realTimeInterval = setInterval(async () => {
      try {
        const rtData = await fetchRealTimeAnalytics();
        setRealTimeData(rtData);
      } catch (err) {
        // Error updating real-time data
      }
    }, 60000); // تحديث كل دقيقة

    // Cleanup intervals on unmount
    return () => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>لا توجد بيانات متاحة. يرجى التحقق من إعدادات Google Analytics.</p>
      </div>
    );
  }

  const { visitors, pageViews, sessionDuration, bounceRate, devices, sources, topPages, countries } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">تحليلات الموقع</h2>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="7d">7 أيام</TabsTrigger>
            <TabsTrigger value="30d">30 يوم</TabsTrigger>
            <TabsTrigger value="90d">90 يوم</TabsTrigger>
            <TabsTrigger value="12m">12 شهر</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">البيانات في الوقت الحقيقي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
                <p className="text-2xl font-bold">{realTimeData.activeUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المشاهدات / دقيقة</p>
                <p className="text-2xl font-bold">{realTimeData.pageViewsPerMinute}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الصفحة الأكثر نشاطاً</p>
                <p className="text-lg font-medium truncate" title={realTimeData.topActivePage}>
                  {realTimeData.topActivePage === '/' ? 'الرئيسية' : realTimeData.topActivePage}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitors.total.toLocaleString()}</div>
            <p className={`text-xs ${visitors.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {visitors.change >= 0 ? '+' : ''}{visitors.change}% من الفترة السابقة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مشاهدات الصفحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageViews.total.toLocaleString()}</div>
            <p className={`text-xs ${pageViews.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pageViews.change >= 0 ? '+' : ''}{pageViews.change}% من الفترة السابقة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط مدة الجلسة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionDuration.total}</div>
            <p className={`text-xs ${sessionDuration.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {sessionDuration.change >= 0 ? '+' : ''}{sessionDuration.change}% من الفترة السابقة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل الارتداد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate.total}%</div>
            <p className={`text-xs ${parseFloat(bounceRate.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(bounceRate.change) >= 0 ? '+' : ''}{bounceRate.change}% من الفترة السابقة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الزيارات ومشاهدات الصفحة</CardTitle>
            <CardDescription>
              إحصائيات الزيارات ومشاهدات الصفحة خلال الفترة المحددة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={visitors.data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" name="الزيارات" dataKey="visitors" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" name="المشاهدات" dataKey="pageViews" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الأجهزة</CardTitle>
            <CardDescription>
              نسبة الزيارات حسب نوع الجهاز المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>مصادر الزيارات</CardTitle>
            <CardDescription>
              توزيع الزيارات حسب مصدر الوصول للموقع
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sources}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="المستخدمين" dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الصفحات الأكثر زيارة</CardTitle>
            <CardDescription>
              الصفحات التي حصلت على أكبر عدد من المشاهدات
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPages}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar name="المشاهدات" dataKey="views" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* إضافة مؤشر جديد: توزيع المستخدمين حسب الدولة */}
      <div className="grid gap-6 md:grid-cols-1">
        <CountryChart countriesData={countries} />
      </div>
    </div>
  );
};

export default AnalyticsOverview;