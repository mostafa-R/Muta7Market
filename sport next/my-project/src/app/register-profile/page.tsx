"use client";
import { Camera, DollarSign, Save, Trophy, Upload, User } from "lucide-react";
import { useState } from "react";
import {
  FiFileText,
  FiInstagram,
  FiMail,
  FiPhone,
  FiTwitter,
  FiUpload,
  FiYoutube,
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "../component/ui/avatar";
import { Button } from "../component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../component/ui/card";
import { Checkbox } from "../component/ui/checkbox";
import { Input } from "../component/ui/input";
import { Label } from "../component/ui/label";
import { RadioGroup, RadioGroupItem } from "../component/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../component/ui/select";
import { PlayerFormData } from "./types/PlayerFormData";

const sports = [
  "كرة اليد",
  "كرة السلة",
  "الكرة الطائرة",
  "الريشة الطائرة",
  "ألعاب القوى",
  "التنس",
  "كرة الطاولة",
  "الكاراتيه",
  "التايكوندو",
  "السهام",
  "الرياضات الالكترونية",
  "السباحة",
  "الجودو",
  "المبارزة",
  "الدراجات الهوائية",
  "الإسكواش",
  "رفع الأثقال",
  "كرة قدم الصالات",
  "الملاكمة",
  "الجمباز",
  "البلياردو والسنوكر",
  "المصارعة",
];

const nationalities = [
  "السعودية",
  "الإمارات",
  "مصر",
  "المغرب",
  "الكويت",
  "قطر",
  "البحرين",
  "عمان",
  "الأردن",
  "لبنان",
  "سوريا",
  "العراق",
  "ليبيا",
  "تونس",
  "الجزائر",
  "السودان",
  "اليمن",
  "أخرى",
];

const useToast = () => ({
  toast: ({ title, description }) => alert(`${title}\n${description}`),
});

export default function RegisterProfile() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PlayerFormData>({
    name: "",
    age: "",
    gender: "",
    nationality: "",
    category: "",
    position: "",
    status: "",
    expreiance: "",
    monthlySalary: { amount: 0, currency: "SAR" },
    contractEndDate: "",
    transferredTo: { club: "", date: "", amount: "" },
    media: {
      profileImage: { url: "", publicId: "" },
      videos: [],
      documents: [],
    },
    socialLinks: { instagram: "", twitter: "", whatsapp: "", youtube: "" },
    isPromoted: { status: false, startDate: "", endDate: "", type: "" },
    contactInfo: {
      isHidden: true,
      email: "",
      phone: "",
      agent: { name: "", phone: "", email: "" },
    },
    game: "",
    agreeToTerms: false,
    profilePicturePreview: "",
    profilePictureFile: undefined,
  });

  // --- Handlers ---
  const handleInput = (field: keyof PlayerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleNested = <T,>(
    parent: keyof PlayerFormData,
    field: keyof T,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };
  const handleAgent = (
    field: keyof PlayerFormData["contactInfo"]["agent"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        agent: { ...prev.contactInfo.agent, [field]: value },
      },
    }));
  };

  const handleTransfer = (
    field: keyof PlayerFormData["transferredTo"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      transferredTo: { ...prev.transferredTo, [field]: value },
    }));
  };
  const handlePromoted = (
    field: keyof PlayerFormData["isPromoted"],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      isPromoted: { ...prev.isPromoted, [field]: value },
    }));
  };
  const handleSocial = (
    field: keyof PlayerFormData["socialLinks"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  };

  // --- File Handlers ---
  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
      });
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({
        title: "خطأ",
        description: "الصورة يجب أن تكون بصيغة JPG، PNG أو GIF",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profilePicturePreview: reader.result as string,
        profilePictureFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Placeholder for video/document upload
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "videos" | "documents"
  ) => {
    const files = Array.from(e.target.files || []);
    const uploaded = files.map((file) => ({
      url: URL.createObjectURL(file),
      publicId: Math.random().toString(36).slice(2),
      title: file.name,
      duration: type === "videos" ? 0 : undefined,
      type: type === "documents" ? file.type : undefined,
      uploadedAt: new Date().toISOString(),
    }));
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: [...prev.media[type], ...uploaded],
      },
    }));
  };

  // --- Submit Handler ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({ title: "خطأ", description: "يجب الموافقة على الشروط والأحكام" });
      return;
    }
    const required: (keyof PlayerFormData)[] = [
      "name",
      "age",
      "gender",
      "nationality",
      "category",
      "status",
      "game",
    ];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length > 0) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }
    toast({
      title: "تم التسجيل بنجاح!",
      description: "تم إنشاء ملفك الشخصي بنجاح.",
    });
    console.log("FormData:", formData);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            سجل بياناتك
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أنشئ ملفك الشخصي الاحترافي وابدأ رحلتك الرياضية معنا
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto space-y-6 p-4 bg-gray-50"
        >
          {/* Personal Info */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <User className="w-5 h-5 text-primary ml-2 mr-2" />
                <span>المعلومات الشخصية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6 space-x-reverse">
                <Avatar className="w-24 h-24 border-4 border-primary/20 ml-2 mr-2">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="bg-primary/10  ">
                    <Camera className="w-8 h-8 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label
                    htmlFor="profile-picture"
                    className="text-sm font-medium"
                  >
                    الصورة الشخصية
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      // onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("profile-picture").click()
                      }
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
                    onChange={(e) => handleInputChange("name", e.target.value)}
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
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="أدخل عمرك"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label>الجنس *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    className="flex space-x-6 space-x-reverse"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse gap-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">ذكر</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse gap-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">أنثى</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">الجنسية *</Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) =>
                      handleInputChange("nationality", value)
                    }
                  >
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

          {/* Sports Info */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Trophy className="w-5 h-5 text-primary mr-2 ml-2" />
                <span>المعلومات الرياضية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sport">الرياضة *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => handleInputChange("sport", value)}
                  >
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
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    placeholder="مثال: مهاجم، حارس مرمى، مدرب لياقة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
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
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالتك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free Agent">
                        حر (بحث عن فريق)
                      </SelectItem>
                      <SelectItem value="Contracted">متعاقد</SelectItem>
                      <SelectItem value="Transferred">منتقل مؤخراً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    placeholder="عدد سنوات ممارسة الرياضة"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="role">الدور *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر دورك (لاعب / مدرب)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Player">لاعب</SelectItem>
                      <SelectItem value="Coach">مدرب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <DollarSign className="w-5 h-5 text-primary mr-2 ml-2" />
                <span>المعلومات المالية (اختيارية)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthly-salary">
                    الراتب الشهري المطلوب ($)
                  </Label>
                  <Input
                    id="monthly-salary"
                    type="number"
                    min="0"
                    value={formData.monthlySalary}
                    onChange={(e) =>
                      handleInputChange("monthlySalary", e.target.value)
                    }
                    placeholder="مثال: 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-contract">
                    قيمة العقد السنوي المطلوب ($)
                  </Label>
                  <Input
                    id="annual-contract"
                    type="number"
                    min="0"
                    value={formData.annualContractValue}
                    onChange={(e) =>
                      handleInputChange("annualContractValue", e.target.value)
                    }
                    placeholder="مثال: 60000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-deadline">
                    موعد انتهاء العقد/الانتقال
                  </Label>
                  <Input
                    id="transfer-deadline"
                    type="date"
                    value={formData.transferDeadline}
                    onChange={(e) =>
                      handleInputChange("transferDeadline", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Info */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FiFileText className="w-5 h-5 text-primary mr-2 ml-2" />
                <span>معلومات الانتقال (اختياري)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="transfer-club">اسم النادي المنتقل إليه</Label>
                  <Input
                    id="transfer-club"
                    placeholder="اسم النادي المنتقل إليه"
                    value={formData.transferredTo.club}
                    onChange={(e) => handleTransfer("club", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-date">تاريخ الانتقال</Label>
                  <Input
                    id="transfer-date"
                    type="date"
                    value={formData.transferredTo.date}
                    onChange={(e) => handleTransfer("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">قيمة الانتقال ($)</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="قيمة الانتقال"
                    value={formData.transferredTo.amount}
                    onChange={(e) =>
                      handleTransfer(
                        "amount",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FiInstagram className="w-5 h-5 text-primary mr-2 ml-2" />
                <span>روابط التواصل الاجتماعي</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="social-instagram"
                    className="flex items-center gap-1"
                  >
                    <FiInstagram className="w-4 h-4" /> Instagram
                  </Label>
                  <Input
                    id="social-instagram"
                    placeholder="Instagram"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleSocial("instagram", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="social-twitter"
                    className="flex items-center gap-1"
                  >
                    <FiTwitter className="w-4 h-4" /> Twitter
                  </Label>
                  <Input
                    id="social-twitter"
                    placeholder="Twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocial("twitter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="social-whatsapp"
                    className="flex items-center gap-1"
                  >
                    <FiPhone className="w-4 h-4" /> WhatsApp
                  </Label>
                  <Input
                    id="social-whatsapp"
                    placeholder="WhatsApp"
                    value={formData.socialLinks.whatsapp}
                    onChange={(e) => handleSocial("whatsapp", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="social-youtube"
                    className="flex items-center gap-1"
                  >
                    <FiYoutube className="w-4 h-4" /> YouTube
                  </Label>
                  <Input
                    id="social-youtube"
                    placeholder="YouTube"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => handleSocial("youtube", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FiMail className="w-5 h-5 text-primary mr-2 ml-2" />
                <span>معلومات التواصل</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 space-x-reverse ">
                  <Checkbox
                    className="mr-2 ml-2"
                    checked={formData.contactInfo.isHidden}
                    onChange={(e) =>
                      handleNested("contactInfo", "isHidden", e.target.checked)
                    }
                  />
                  <span>إخفاء معلومات التواصل عن الجميع</span>
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-email"
                    className="flex items-center gap-1"
                  >
                    <FiMail className="w-4 h-4" /> البريد الإلكتروني
                  </Label>
                  <Input
                    id="contact-email"
                    placeholder="البريد الإلكتروني"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      handleNested("contactInfo", "email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-phone"
                    className="flex items-center gap-1"
                  >
                    <FiPhone className="w-4 h-4" /> رقم الهاتف
                  </Label>
                  <Input
                    id="contact-phone"
                    placeholder="رقم الهاتف"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      handleNested("contactInfo", "phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>معلومات الوكيل (اختياري)</Label>
                  <Input
                    placeholder="اسم الوكيل"
                    value={formData.contactInfo.agent.name}
                    onChange={(e) => handleAgent("name", e.target.value)}
                  />
                  <Input
                    placeholder="هاتف الوكيل"
                    value={formData.contactInfo.agent.phone}
                    onChange={(e) => handleAgent("phone", e.target.value)}
                  />
                  <Input
                    placeholder="بريد الوكيل"
                    value={formData.contactInfo.agent.email}
                    onChange={(e) => handleAgent("email", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FiUpload className="w-5 h-5 text-primary mr-2 ml-2 " />
                <span>رفع فيديوهات رياضية (اختياري)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="media-upload">اختيار ملفات الفيديو</Label>
                <Input
                  id="media-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, "videos")}
                />
              </div>
              {formData.media.videos.length > 0 && (
                <div className="space-y-2">
                  <Label>الفيديوهات المرفوعة:</Label>
                  <ul className="list-disc pl-5 space-y-1">
                    {formData.media.videos.map((video, idx) => (
                      <li key={video.publicId || idx}>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="border-0 shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <FiUpload className="w-5 h-5 text-primary mr-2 ml-2 " />
                <span>رفع مستندات داعمة (PDF أو صور) (اختياري)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-upload">اختيار الملفات</Label>
                <Input
                  id="document-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, "documents")}
                />
              </div>
              {formData.media.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>المستندات المرفوعة:</Label>
                  <ul className="list-disc pl-5 space-y-1">
                    {formData.media.documents.map((doc, idx) => (
                      <li key={doc.publicId || idx}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {doc.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                    handleInputChange("agreeToTerms", !!checked)
                  }
                />
                <div className="flex-1 mr-2 ml-2">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    أوافق على{" "}
                    <span className="text-primary hover:underline cursor-pointer">
                      الشروط والأحكام
                    </span>{" "}
                    و
                    <span className="text-primary hover:underline cursor-pointer">
                      {" "}
                      سياسة الخصوصية
                    </span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    بتسجيلك تُوافق على عرض بياناتك للأندية والمدربين المهتمين
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="default"
              size="xl"
              className="hover:shadow-form w-full rounded-md bg-[hsl(var(--primary))] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="w-5 h-5 ml-2" />
              إنشاء الملف الشخصي
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
