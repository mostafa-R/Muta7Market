"use client";
import { useState } from "react";
import { Camera, DollarSign, Save, Trophy, Upload, User } from "lucide-react";
import {
  FiFileText,
  FiInstagram,
  FiMail,
  FiPhone,
  FiTwitter,
  FiUpload,
  FiYoutube,
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Button } from "@/app/component/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/component/ui/radio-group";
import {
  PlayerFormData,
  ProfileStatus,
  Category,
  Gender,
} from "./types/PlayerFormData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { useFormik } from "formik";
import Joi from "joi";
import { playerFormSchema } from "./types/schema";
import axios from "axios";

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

export default function RegisterProfile() {
  const handleSubmit = async (
    values: any,
    { setSubmitting, setErrors, resetForm }: any
  ) => {
    console.log(values);
    try {
      const payload = {
        ...values,
        gender: values.gender?.toLowerCase(),
        jop: values.category,
        // add any required data processing here
        contractEndDate: values.contractEndDate
          ? new Date(values.contractEndDate)
          : null,
      };
      const res = await axios.post(
        "http://localhost:5000/api/v1/players/createPlayer",
        payload
      );
      alert("تم إرسال البيانات بنجاح!");
      resetForm();
    } catch (error: any) {
      if (error.response) {
        if (error.response.data?.errors) {
          setErrors(error.response.data.errors);
        }
        alert(error.response.data?.message || "حدث خطأ أثناء إرسال البيانات");
        console.log("Backend error:", error.response.data);
      } else if (error.request) {
        alert("لم يتم تلقي رد من السيرفر");
        console.log("No response:", error.request);
      } else {
        alert("خطأ غير متوقع");
        console.log("Unknown error:", error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
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
    },
    validate: (values) => {
      const { error } = playerFormSchema.validate(values, {
        abortEarly: false,
      });
      if (!error) return {};
      const errors: any = {};
      error.details.forEach((detail) => {
        // nested fields (dot notation)
        const path = detail.path.join(".");
        errors[path] = detail.message;
      });
      return errors;
    },
    onSubmit: handleSubmit,
  });

  // const handleInput = (field: keyof PlayerFormData, value: any) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };
  // const handleNested = <T,>(
  //   parent: keyof PlayerFormData,
  //   field: keyof T,
  //   value: any
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [parent]: { ...prev[parent], [field]: value },
  //   }));
  // };
  // const handleAgent = (
  //   field: keyof PlayerFormData["contactInfo"]["agent"],
  //   value: string
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     contactInfo: {
  //       ...prev.contactInfo,
  //       agent: { ...prev.contactInfo.agent, [field]: value },
  //     },
  //   }));
  // };
  // const handleTransfer = (
  //   field: keyof PlayerFormData["transferredTo"],
  //   value: any
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     transferredTo: { ...prev.transferredTo, [field]: value },
  //   }));
  // };
  // const handlePromoted = (
  //   field: keyof PlayerFormData["isPromoted"],
  //   value: any
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     isPromoted: { ...prev.isPromoted, [field]: value },
  //   }));
  // };
  // const handleSocial = (
  //   field: keyof PlayerFormData["socialLinks"],
  //   value: string
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     socialLinks: { ...prev.socialLinks, [field]: value },
  //   }));
  // };
  // const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       profilePicturePreview: reader.result as string,
  //       profilePictureFile: file,
  //     }));
  //   };
  //   reader.readAsDataURL(file);
  // };
  // const handleMediaUpload = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   type: "videos" | "documents"
  // ) => {
  //   const files = Array.from(e.target.files || []);
  //   const uploaded = files.map((file) => ({
  //     url: URL.createObjectURL(file),
  //     publicId: Math.random().toString(36).slice(2),
  //     title: file.name,
  //     duration: type === "videos" ? 0 : undefined,
  //     type: type === "documents" ? file.type : undefined,
  //     uploadedAt: new Date().toISOString(),
  //   }));
  //   setFormData((prev) => ({
  //     ...prev,
  //     media: {
  //       ...prev.media,
  //       [type]: [...prev.media[type], ...uploaded],
  //     },
  //   }));
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const required: (keyof PlayerFormData)[] = [
  //     "name",
  //     "age",
  //     "gender",
  //     "nationality",
  //     "category",
  //     "status",
  //     "game",
  //   ];
  // };

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
          onSubmit={formik.handleSubmit}
          className="max-w-3xl mx-auto space-y-6 p-4"
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
              <div className="flex items-center space-x-6 space-x-reverse">
                <Avatar className="w-24 h-24 border-4 border-primary/20 ml-2 mr-2">
                  <AvatarImage src={formik.values.profilePicturePreview} />
                  <AvatarFallback className="bg-primary/10">
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          formik.setFieldValue(
                            "profilePicturePreview",
                            reader.result as string
                          );
                          formik.setFieldValue("profilePictureFile", file);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("profile-picture")?.click()
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
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">العمر *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="16"
                    max="50"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="أدخل عمرك"
                    required
                  />
                  {formik.touched.age && formik.errors.age && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.age}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Label>الجنس *</Label>
                  <RadioGroup
                    value={formik.values.gender}
                    onValueChange={(value) =>
                      formik.setFieldValue("gender", value)
                    }
                    onBlur={() => formik.setFieldTouched("gender", true)}
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
                  {formik.touched.gender && formik.errors.gender && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.gender}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">الجنسية *</Label>
                  <Select
                    value={formik.values.nationality}
                    onValueChange={(value) =>
                      formik.setFieldValue("nationality", value)
                    }
                    onBlur={() => formik.setFieldTouched("nationality", true)}
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
                  {formik.touched.nationality && formik.errors.nationality && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.nationality}
                    </div>
                  )}
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
                  <Label htmlFor="game">الرياضة *</Label>
                  <Select
                    value={formik.values.game}
                    onValueChange={(value) =>
                      formik.setFieldValue("game", value)
                    }
                    onBlur={() => formik.setFieldTouched("game", true)}
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
                  {formik.touched.game && formik.errors.game && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.game}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">المركز/التخصص</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formik.values.position}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="مثال: مهاجم، حارس مرمى، مدرب لياقة"
                  />
                  {formik.touched.position && formik.errors.position && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.position}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={formik.values.category}
                    onValueChange={(value) =>
                      formik.setFieldValue("category", value)
                    }
                    onBlur={() => formik.setFieldTouched("category", true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئتك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">لاعب</SelectItem>
                      <SelectItem value="coach">مدرب</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.category}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة الحالية *</Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                    onBlur={() => formik.setFieldTouched("status", true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالتك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">
                        حر (بحث عن فريق)
                      </SelectItem>
                      <SelectItem value="CONTRACTED">متعاقد</SelectItem>
                      <SelectItem value="TRANSFERRED">منتقل مؤخراً</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.status}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expreiance">سنوات الخبرة</Label>
                  <Input
                    id="expreiance"
                    name="expreiance"
                    type="number"
                    min="0"
                    max="30"
                    value={formik.values.expreiance}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="عدد سنوات ممارسة الرياضة"
                  />
                  {formik.touched.expreiance && formik.errors.expreiance && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.expreiance}
                    </div>
                  )}
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
                    الراتب الشهري المطلوب (بالريال)
                  </Label>
                  <Input
                    id="monthly-salary"
                    name="monthlySalary.amount"
                    type="number"
                    min="0"
                    value={formik.values.monthlySalary.amount}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "monthlySalary.amount",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    onBlur={() =>
                      formik.setFieldTouched("monthlySalary.amount", true)
                    }
                    placeholder="مثال: 5000"
                  />
                  {formik.touched["monthlySalary.amount"] &&
                    formik.errors["monthlySalary.amount"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["monthlySalary.amount"]}
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract-end-date">
                    تاريخ نهاية العقد الحالي
                  </Label>
                  <Input
                    id="contract-end-date"
                    name="contractEndDate"
                    type="date"
                    value={formik.values.contractEndDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.contractEndDate &&
                    formik.errors.contractEndDate && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.contractEndDate}
                      </div>
                    )}
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
                    name="transferredTo.club"
                    placeholder="اسم النادي المنتقل إليه"
                    value={formik.values.transferredTo.club}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["transferredTo.club"] &&
                    formik.errors["transferredTo.club"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["transferredTo.club"]}
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-date">تاريخ الانتقال</Label>
                  <Input
                    id="transfer-date"
                    name="transferredTo.date"
                    type="date"
                    value={formik.values.transferredTo.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["transferredTo.date"] &&
                    formik.errors["transferredTo.date"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["transferredTo.date"]}
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">
                    قيمة الانتقال (بالريال)
                  </Label>
                  <Input
                    id="transfer-amount"
                    name="transferredTo.amount"
                    type="number"
                    placeholder="قيمة الانتقال"
                    value={formik.values.transferredTo.amount}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "transferredTo.amount",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    onBlur={() =>
                      formik.setFieldTouched("transferredTo.amount", true)
                    }
                  />
                  {formik.touched["transferredTo.amount"] &&
                    formik.errors["transferredTo.amount"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["transferredTo.amount"]}
                      </div>
                    )}
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
                    name="socialLinks.instagram"
                    placeholder="Instagram"
                    value={formik.values.socialLinks.instagram}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["socialLinks.instagram"] &&
                    formik.errors["socialLinks.instagram"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["socialLinks.instagram"]}
                      </div>
                    )}
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
                    name="socialLinks.twitter"
                    placeholder="Twitter"
                    value={formik.values.socialLinks.twitter}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["socialLinks.twitter"] &&
                    formik.errors["socialLinks.twitter"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["socialLinks.twitter"]}
                      </div>
                    )}
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
                    name="socialLinks.whatsapp"
                    placeholder="WhatsApp"
                    value={formik.values.socialLinks.whatsapp}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["socialLinks.whatsapp"] &&
                    formik.errors["socialLinks.whatsapp"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["socialLinks.whatsapp"]}
                      </div>
                    )}
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
                    name="socialLinks.youtube"
                    placeholder="YouTube"
                    value={formik.values.socialLinks.youtube}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["socialLinks.youtube"] &&
                    formik.errors["socialLinks.youtube"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["socialLinks.youtube"]}
                      </div>
                    )}
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
                    checked={formik.values.contactInfo.isHidden}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("contactInfo.isHidden", !!checked)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("contactInfo.isHidden", true)
                    }
                  />
                  <span>إخفاء معلومات التواصل عن الجميع</span>
                </Label>
                {formik.touched["contactInfo.isHidden"] &&
                  formik.errors["contactInfo.isHidden"] && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors["contactInfo.isHidden"]}
                    </div>
                  )}
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
                    name="contactInfo.email"
                    placeholder="البريد الإلكتروني"
                    value={formik.values.contactInfo.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["contactInfo.email"] &&
                    formik.errors["contactInfo.email"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["contactInfo.email"]}
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-phone"
                    className="flex items-center gap-1"
                  >
                    <FiPhone className="w-4 h-4" /> رقم الهاتف
                  </Label>
                  <Input
                    type="number"
                    id="contact-phone"
                    name="contactInfo.phone"
                    placeholder="رقم الهاتف"
                    value={formik.values.contactInfo.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["contactInfo.phone"] &&
                    formik.errors["contactInfo.phone"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["contactInfo.phone"]}
                      </div>
                    )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>معلومات الوكيل (اختياري)</Label>
                  <Input
                    placeholder="اسم الوكيل"
                    name="contactInfo.agent.name"
                    value={formik.values.contactInfo.agent.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["contactInfo.agent.name"] &&
                    formik.errors["contactInfo.agent.name"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["contactInfo.agent.name"]}
                      </div>
                    )}
                  <Input
                    type="number"
                    placeholder="هاتف الوكيل"
                    name="contactInfo.agent.phone"
                    value={formik.values.contactInfo.agent.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["contactInfo.agent.phone"] &&
                    formik.errors["contactInfo.agent.phone"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["contactInfo.agent.phone"]}
                      </div>
                    )}
                  <Input
                    placeholder="بريد الوكيل"
                    name="contactInfo.agent.email"
                    value={formik.values.contactInfo.agent.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched["contactInfo.agent.email"] &&
                    formik.errors["contactInfo.agent.email"] && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors["contactInfo.agent.email"]}
                      </div>
                    )}
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
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const uploaded = files.map((file) => ({
                      url: URL.createObjectURL(file),
                      publicId: Math.random().toString(36).slice(2),
                      title: file.name,
                      duration: 0,
                      uploadedAt: new Date().toISOString(),
                    }));
                    formik.setFieldValue("media.videos", [
                      ...formik.values.media.videos,
                      ...uploaded,
                    ]);
                  }}
                />
              </div>
              {formik.values.media.videos.length > 0 && (
                <div className="space-y-2">
                  <Label>الفيديوهات المرفوعة:</Label>
                  <ul className="list-disc pl-5 space-y-1">
                    {formik.values.media.videos.map((video, idx) => (
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
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const uploaded = files.map((file) => ({
                      url: URL.createObjectURL(file),
                      publicId: Math.random().toString(36).slice(2),
                      title: file.name,
                      type: file.type,
                      uploadedAt: new Date().toISOString(),
                    }));
                    formik.setFieldValue("media.documents", [
                      ...formik.values.media.documents,
                      ...uploaded,
                    ]);
                  }}
                />
              </div>
              {formik.values.media.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>المستندات المرفوعة:</Label>
                  <ul className="list-disc pl-5 space-y-1">
                    {formik.values.media.documents.map((doc, idx) => (
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
                  checked={formik.values.agreeToTerms}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("agreeToTerms", !!checked)
                  }
                  onBlur={() => formik.setFieldTouched("agreeToTerms", true)}
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
                  {formik.touched.agreeToTerms &&
                    formik.errors.agreeToTerms && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.agreeToTerms}
                      </div>
                    )}
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
