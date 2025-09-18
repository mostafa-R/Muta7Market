import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/component/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CountryChart = ({ countriesData = [] }) => {
  if (!countriesData || countriesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توزيع المستخدمين حسب الدولة</CardTitle>
          <CardDescription>
            لا توجد بيانات متاحة حاليًا
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">لا توجد بيانات كافية لعرض توزيع المستخدمين حسب الدولة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع المستخدمين حسب الدولة</CardTitle>
        <CardDescription>
          توزيع الزيارات حسب الدول خلال الفترة المحددة
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={countriesData}
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
              <Bar name="المستخدمين" dataKey="users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryChart;
