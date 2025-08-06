"use client";
import { useState } from 'react';
import Navbar from '../component/header';
import { Textarea } from '../component/ui/textarea';
import { Button } from '../component/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../component/ui/card';
import { Input } from '../component/ui/input';
import { Label } from '../component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../component/ui/select';
import { RadioGroup, RadioGroupItem } from '../component/ui/radio-group';
import { Checkbox } from '../component/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../component/ui/avatar';
import { 
  User, 
  Upload, 
  Calendar, 
  MapPin, 
  Trophy, 
  DollarSign, 
  FileText,
  Star,
  Save,
  Camera
} from 'lucide-react';

const useToast = () => ({
  toast: ({ title, description }) =>
    alert(`${title}\n${description}`),
});

const RegisterProfile = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    nationality: '',
    sport: '',
    position: '',
    category: '',
    status: '',
    monthlySalary: '',
    annualContractValue: '',
    contractConditions: '',
    transferDeadline: '',
    experience: '',
    profilePicture: '',
    agreeToTerms: false,
  });

  const sports = [
    'كرة القدم', 'كرة السلة', 'التنس', 'السباحة', 'ألعاب القوى',
    'ركوب الدراجات', 'رفع الأثقال', 'الكرة الطائرة', 'أخرى'
  ];

  const nationalities = [
    'السعودية', 'الإمارات', 'مصر', 'المغرب', 'الكويت', 'قطر', 'البحرين', 'عمان',
    'الأردن', 'لبنان', 'سوريا', 'العراق', 'ليبيا', 'تونس', 'الجزائر', 'السودان', 'اليمن', 'أخرى'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({
        title: "خطأ",
        description: "يجب الموافقة على الشروط والأحكام",
        variant: "destructive"
      });
      return;
    }
    const requiredFields = ['name', 'age', 'gender', 'nationality', 'sport', 'category', 'status'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    // Placeholder for API submission
    // Example: 
    // const formDataToSend = new FormData();
    // formDataToSend.append('profilePicture', formData.profilePictureFile);
    // Object.entries(formData).forEach(([key, value]) => {
    //   if (key !== 'profilePictureFile') formDataToSend.append(key, value);
    // });
    // fetch('YOUR_API_ENDPOINT', { method: 'POST', body: formDataToSend });
    toast({
      title: "تم التسجيل بنجاح!",
      description: "تم إنشاء ملفك الشخصي بنجاح. سيتم مراجعته قريباً.",
    });
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "خطأ",
          description: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
          variant: "destructive"
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          title: "خطأ",
          description: "الصورة يجب أن تكون بصيغة JPG، PNG أو GIF",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result, // Base64 for preview
          profilePictureFile: file // Actual file for upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            سجل بياناتك كلاعب
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أنشئ ملفك الشخصي الاحترافي وابدأ رحلتك الرياضية معنا
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <User className="w-5 h-5 text-primary" />
                <span>المعلومات الشخصية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6 space-x-reverse">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="bg-primary/10">
                    <Camera className="w-8 h-8 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-picture" className="text-sm font-medium">
                    الصورة الشخصية
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('profile-picture').click()}
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع صورة
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG أو GIF (حد أقصى 2MB)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">العمر *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="50"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="أدخل عمرك"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label>الجنس *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    className="flex space-x-6 space-x-reverse"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">ذكر</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">أنثى</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">الجنسية *</Label>
                  <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر جنسيتك" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sports Information */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Trophy className="w-5 h-5 text-primary" />
                <span>المعلومات الرياضية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sport">الرياضة *</Label>
                  <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر رياضتك" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">المركز/التخصص</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="مثال: مهاجم، حارس مرمى، عداء سرعة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئتك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amateur">هاوي</SelectItem>
                      <SelectItem value="Professional">محترف</SelectItem>
                      <SelectItem value="Elite">نخبة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة الحالية *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالتك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free Agent">حر (بحث عن فريق)</SelectItem>
                      <SelectItem value="Contracted">متعاقد</SelectItem>
                      <SelectItem value="Transferred">منتقل مؤخراً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="عدد سنوات ممارسة الرياضة"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>المعلومات المالية (اختيارية)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthly-salary">الراتب الشهري المطلوب ($)</Label>
                  <Input
                    id="monthly-salary"
                    type="number"
                    min="0"
                    value={formData.monthlySalary}
                    onChange={(e) => handleInputChange('monthlySalary', e.target.value)}
                    placeholder="مثال: 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-contract">قيمة العقد السنوي المطلوب ($)</Label>
                  <Input
                    id="annual-contract"
                    type="number"
                    min="0"
                    value={formData.annualContractValue}
                    onChange={(e) => handleInputChange('annualContractValue', e.target.value)}
                    placeholder="مثال: 60000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-deadline">موعد انتهاء العقد/الانتقال</Label>
                  <Input
                    id="transfer-deadline"
                    type="date"
                    value={formData.transferDeadline}
                    onChange={(e) => handleInputChange('transferDeadline', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FileText className="w-5 h-5 text-primary" />
                <span>معلومات إضافية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contract-conditions">شروط العقد المفضلة</Label>
                <Textarea
                  id="contract-conditions"
                  value={formData.contractConditions}
                  onChange={(e) => handleInputChange('contractConditions', e.target.value)}
                  placeholder="أدخل أي شروط خاصة أو متطلبات للعقد..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="border-0 shadow-card bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange('agreeToTerms', !!checked)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    أوافق على <span className="text-primary hover:underline cursor-pointer">الشروط والأحكام</span> و
                    <span className="text-primary hover:underline cursor-pointer"> سياسة الخصوصية</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    بتسجيلك تُوافق على عرض بياناتك للأندية والمدربين المهتمين
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button type="submit" variant="default" size="xl" className="px-12">
              <Save className="w-5 h-5 ml-2" />
              إنشاء الملف الشخصي
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterProfile;