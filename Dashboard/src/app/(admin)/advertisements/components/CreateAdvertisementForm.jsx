import { Button } from "@/app/component/ui/button";
import { Checkbox } from "@/app/component/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/component/ui/form";
import { Input } from "@/app/component/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/component/ui/radio-group";
import { Switch } from "@/app/component/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import { Textarea } from "@/app/component/ui/textarea";
import { api } from "@/lib/api";
import Joi from "joi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = Joi.object({
  titleAr: Joi.string().min(2).required().messages({
    "string.min": "العنوان بالعربية مطلوب ويجب أن يكون أكثر من حرفين",
    "any.required": "العنوان بالعربية مطلوب"
  }),
  titleEn: Joi.string().min(2).required().messages({
    "string.min": "العنوان بالإنجليزية مطلوب ويجب أن يكون أكثر من حرفين",
    "any.required": "العنوان بالإنجليزية مطلوب"
  }),
  descriptionAr: Joi.string().allow("").optional(),
  descriptionEn: Joi.string().allow("").optional(),
  type: Joi.string().valid("banner", "popup", "sidebar", "native").required().messages({
    "any.only": "يرجى اختيار نوع الإعلان",
    "any.required": "يرجى اختيار نوع الإعلان"
  }),
  position: Joi.string().valid("home", "search", "profile", "listing").required().messages({
    "any.only": "يرجى اختيار موقع الإعلان",
    "any.required": "يرجى اختيار موقع الإعلان"
  }),
  link: Joi.string().uri().required().messages({
    "string.uri": "يرجى إدخال رابط صحيح",
    "any.required": "رابط الإعلان مطلوب"
  }),
  startDate: Joi.date().required().messages({
    "any.required": "تاريخ البدء مطلوب"
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    "any.required": "تاريخ الانتهاء مطلوب",
    "date.min": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
  }),
  isActive: Joi.boolean().default(true),
  priority: Joi.number().min(0).default(0),
  desktopImage: Joi.any().required().messages({
    "any.required": "صورة سطح المكتب مطلوبة"
  }),
  mobileImage: Joi.any().optional(),
  advertiserName: Joi.string().min(2).required().messages({
    "string.min": "اسم المعلن مطلوب",
    "any.required": "اسم المعلن مطلوب"
  }),
  advertiserEmail: Joi.string().email().required().messages({
    "string.email": "يرجى إدخال بريد إلكتروني صحيح",
    "any.required": "البريد الإلكتروني مطلوب"
  }),
  advertiserPhone: Joi.string().allow("").optional(),
  targetCountries: Joi.array().items(Joi.string()).optional(),
  targetSports: Joi.array().items(Joi.string()).optional(),
  targetGender: Joi.string().valid("all", "male", "female").default("all"),
  targetAgeMin: Joi.number().min(0).optional(),
  targetAgeMax: Joi.number().min(0).optional(),
});

const adTypeOptions = [
  { value: "banner", label: "بانر" },
  { value: "popup", label: "نافذة منبثقة" },
  { value: "sidebar", label: "شريط جانبي" },
  { value: "native", label: "إعلان مدمج" },
];

const adPositionOptions = [
  { value: "home", label: "الصفحة الرئيسية" },
  { value: "search", label: "صفحة البحث" },
  { value: "profile", label: "صفحة الملف الشخصي" },
  { value: "listing", label: "صفحة القوائم" },
];

const genderOptions = [
  { value: "all", label: "الكل" },
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

// دالة للتحقق من صحة البيانات
const validateForm = (data) => {
  const { error, value } = formSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return { errors, isValid: false };
  }
  return { errors: {}, isValid: true, data: value };
};

export default function CreateAdvertisementForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [sports, setSports] = useState([]);
  const [countries, setCountries] = useState([
    { code: "SA", name: "السعودية" },
    { code: "AE", name: "الإمارات" },
    { code: "KW", name: "الكويت" },
    { code: "QA", name: "قطر" },
    { code: "BH", name: "البحرين" },
    { code: "OM", name: "عمان" },
    { code: "EG", name: "مصر" },
  ]);

  const form = useForm({
    defaultValues: {
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      type: "banner",
      position: "home",
      link: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      priority: 0,
      advertiserName: "",
      advertiserEmail: "",
      advertiserPhone: "",
      targetCountries: [],
      targetSports: [],
      targetGender: "all",
      targetAgeMin: "",
      targetAgeMax: "",
    },
  });

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await api.get("/sports");
        setSports(response.data.data || []);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
  }, []);

  const handleDesktopImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesktopImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDesktopImagePreview(null);
    }
  };

  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMobileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMobileImagePreview(null);
    }
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      // التحقق من صحة البيانات
      const validation = validateForm(values);
      if (!validation.isValid) {
        // عرض الأخطاء
        Object.keys(validation.errors).forEach((field) => {
          form.setError(field, { message: validation.errors[field] });
        });
        return;
      }

      const formData = new FormData();
      formData.append("title[ar]", values.titleAr);
      formData.append("title[en]", values.titleEn);
      
      if (values.descriptionAr) {
        formData.append("description[ar]", values.descriptionAr);
      }
      
      if (values.descriptionEn) {
        formData.append("description[en]", values.descriptionEn);
      }
      
      formData.append("type", values.type);
      formData.append("position", values.position);
      formData.append("link", values.link);
      formData.append("displayPeriod[startDate]", values.startDate.toISOString());
      formData.append("displayPeriod[endDate]", values.endDate.toISOString());
      formData.append("isActive", values.isActive);
      formData.append("priority", values.priority);
      
      // Advertiser info
      formData.append("advertiser[name]", values.advertiserName);
      formData.append("advertiser[email]", values.advertiserEmail);
      
      if (values.advertiserPhone) {
        formData.append("advertiser[phone]", values.advertiserPhone);
      }
      
      // Targeting
      if (values.targetCountries && values.targetCountries.length > 0) {
        values.targetCountries.forEach((country) => {
          formData.append("targeting[countries][]", country);
        });
      }
      
      if (values.targetSports && values.targetSports.length > 0) {
        values.targetSports.forEach((sport) => {
          formData.append("targeting[sports][]", sport);
        });
      }
      
      formData.append("targeting[gender]", values.targetGender);
      
      if (values.targetAgeMin) {
        formData.append("targeting[ageRange][min]", values.targetAgeMin);
      }
      
      if (values.targetAgeMax) {
        formData.append("targeting[ageRange][max]", values.targetAgeMax);
      }
      
      // Images
      if (values.desktopImage && values.desktopImage.length > 0) {
        formData.append("desktopImage", values.desktopImage[0]);
      }
      
      if (values.mobileImage && values.mobileImage.length > 0) {
        formData.append("mobileImage", values.mobileImage[0]);
      }

      await api.post("/advertisements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.reset();
      setDesktopImagePreview(null);
      setMobileImagePreview(null);
      onSuccess();
    } catch (error) {
      console.error("Error creating advertisement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
            <TabsTrigger value="media">الوسائط</TabsTrigger>
            <TabsTrigger value="advertiser">معلومات المعلن</TabsTrigger>
            <TabsTrigger value="targeting">الاستهداف</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="titleAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان بالعربية</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الإعلان بالعربية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان بالإنجليزية</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter advertisement title in English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف بالعربية</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصف الإعلان بالعربية"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف بالإنجليزية</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter advertisement description in English"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>نوع الإعلان</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {adTypeOptions.map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>موقع الإعلان</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {adPositionOptions.map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الإعلان</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      الرابط الذي سيتم توجيه المستخدم إليه عند النقر على الإعلان
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      الأولوية تحدد ترتيب ظهور الإعلان (الأرقام الأعلى تعني أولوية أعلى)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>تاريخ البدء</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>تاريخ الانتهاء</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          min={form.getValues("startDate") ? form.getValues("startDate").toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">الحالة</FormLabel>
                      <FormDescription>
                        تفعيل أو تعطيل هذا الإعلان
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="desktopImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>صورة سطح المكتب</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        {...field}
                        onChange={(e) => {
                          onChange(e.target.files);
                          handleDesktopImageChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      اختر صورة للعرض على أجهزة سطح المكتب (مطلوب)
                    </FormDescription>
                    <FormMessage />
                    {desktopImagePreview && (
                      <div className="mt-2">
                        <img
                          src={desktopImagePreview}
                          alt="معاينة سطح المكتب"
                          className="max-h-32 object-contain rounded border"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>صورة الجوال</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        {...field}
                        onChange={(e) => {
                          onChange(e.target.files);
                          handleMobileImageChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      اختر صورة للعرض على أجهزة الجوال (اختياري)
                    </FormDescription>
                    <FormMessage />
                    {mobileImagePreview && (
                      <div className="mt-2">
                        <img
                          src={mobileImagePreview}
                          alt="معاينة الجوال"
                          className="max-h-32 object-contain rounded border"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="advertiser" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="advertiserName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المعلن</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المعلن" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advertiserEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني للمعلن</FormLabel>
                    <FormControl>
                      <Input placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advertiserPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم هاتف المعلن</FormLabel>
                    <FormControl>
                      <Input placeholder="+966XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormDescription>اختياري</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="targetCountries"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">استهداف البلدان</FormLabel>
                      <FormDescription>
                        اختر البلدان التي تريد استهدافها (اترك فارغًا للاستهداف العالمي)
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {countries.map((country) => (
                        <FormItem
                          key={country.code}
                          className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(country.code)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], country.code])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== country.code
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {country.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetSports"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">استهداف الرياضات</FormLabel>
                      <FormDescription>
                        اختر الرياضات التي تريد استهدافها (اترك فارغًا لاستهداف جميع الرياضات)
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sports.map((sport) => (
                        <FormItem
                          key={sport._id}
                          className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(sport._id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], sport._id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== sport._id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {sport.name.ar}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetGender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>استهداف الجنس</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4 rtl:space-x-reverse"
                      >
                        {genderOptions.map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetAgeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأدنى للعمر</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="18"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        />
                      </FormControl>
                      <FormDescription>
                        اترك فارغًا إذا لم يكن هناك حد أدنى للعمر
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAgeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأقصى للعمر</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="65"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        />
                      </FormControl>
                      <FormDescription>
                        اترك فارغًا إذا لم يكن هناك حد أقصى للعمر
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting} className="mt-6">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          إنشاء الإعلان
        </Button>
      </form>
    </Form>
  );
}
