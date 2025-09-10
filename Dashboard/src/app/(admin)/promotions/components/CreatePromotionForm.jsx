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
import { Textarea } from "@/app/component/ui/textarea";
import { api } from "@/lib/api";
import Joi from "joi";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = Joi.object({
  nameAr: Joi.string().min(2).required().messages({
    "string.min": "الاسم بالعربية مطلوب ويجب أن يكون أكثر من حرفين",
    "any.required": "الاسم بالعربية مطلوب"
  }),
  nameEn: Joi.string().min(2).required().messages({
    "string.min": "الاسم بالإنجليزية مطلوب ويجب أن يكون أكثر من حرفين",
    "any.required": "الاسم بالإنجليزية مطلوب"
  }),
  descriptionAr: Joi.string().allow("").optional(),
  descriptionEn: Joi.string().allow("").optional(),
  code: Joi.string().min(3).required().messages({
    "string.min": "الكود مطلوب ويجب أن يكون أكثر من 3 أحرف",
    "any.required": "الكود مطلوب"
  }),
  type: Joi.string().valid("percentage", "fixed", "free").required().messages({
    "any.only": "يرجى اختيار نوع الخصم",
    "any.required": "يرجى اختيار نوع الخصم"
  }),
  value: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).optional(),
  applicableTo: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "يجب اختيار خدمة واحدة على الأقل",
    "any.required": "يجب اختيار خدمة واحدة على الأقل"
  }),
  startDate: Joi.date().required().messages({
    "any.required": "تاريخ البدء مطلوب"
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    "any.required": "تاريخ الانتهاء مطلوب",
    "date.min": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
  }),
  usageLimitPerUser: Joi.number().min(0).optional(),
  usageLimitTotal: Joi.number().min(0).optional(),
  minimumPurchase: Joi.number().min(0).optional(),
  isActive: Joi.boolean().default(true),
  image: Joi.any().optional(),
});

const applicableToOptions = [
  { id: "contactAccess", label: "الوصول للتواصل" },
  { id: "listing", label: "النشر" },
  { id: "promotion", label: "الترويج" },
  { id: "subscription", label: "الاشتراك" },
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

export default function CreatePromotionForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const form = useForm({
    defaultValues: {
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      code: "",
      type: "percentage",
      value: 0,
      maxDiscount: 0,
      applicableTo: ["contactAccess"],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      usageLimitPerUser: 1,
      usageLimitTotal: 100,
      minimumPurchase: 0,
      isActive: true,
    },
  });

  const watchType = form.watch("type");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
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
      formData.append("name[ar]", values.nameAr);
      formData.append("name[en]", values.nameEn);
      formData.append("description[ar]", values.descriptionAr);
      formData.append("description[en]", values.descriptionEn);
      formData.append("code", values.code);
      formData.append("type", values.type);
      
      if (values.type !== "free") {
        formData.append("value", values.value);
      }
      
      if (values.type === "percentage" && values.maxDiscount) {
        formData.append("maxDiscount", values.maxDiscount);
      }
      
      values.applicableTo.forEach((item) => {
        formData.append("applicableTo[]", item);
      });
      
      formData.append("validityPeriod[startDate]", values.startDate.toISOString());
      formData.append("validityPeriod[endDate]", values.endDate.toISOString());
      
      if (values.usageLimitPerUser) {
        formData.append("usageLimit[perUser]", values.usageLimitPerUser);
      }
      
      if (values.usageLimitTotal) {
        formData.append("usageLimit[total]", values.usageLimitTotal);
      }
      
      if (values.minimumPurchase) {
        formData.append("minimumPurchase", values.minimumPurchase);
      }
      
      formData.append("isActive", values.isActive);
      
      if (values.image && values.image.length > 0) {
        formData.append("media", values.image[0]);
      }

      await api.post("/promotional-offers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.reset();
      setImagePreview(null);
      onSuccess();
    } catch (error) {
      console.error("Error creating promotion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم بالعربية</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم العرض بالعربية" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم بالإنجليزية</FormLabel>
                <FormControl>
                  <Input placeholder="Enter promotion name in English" {...field} />
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
                    placeholder="أدخل وصف العرض بالعربية"
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
                    placeholder="Enter promotion description in English"
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كود الخصم</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: SUMMER2023" {...field} />
                </FormControl>
                <FormDescription>
                  كود فريد يستخدمه المستخدم للحصول على الخصم
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>نوع الخصم</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <RadioGroupItem value="percentage" />
                      </FormControl>
                      <FormLabel className="font-normal">نسبة مئوية</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <RadioGroupItem value="fixed" />
                      </FormControl>
                      <FormLabel className="font-normal">قيمة ثابتة</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <RadioGroupItem value="free" />
                      </FormControl>
                      <FormLabel className="font-normal">مجاني</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchType !== "free" && (
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchType === "percentage" ? "نسبة الخصم (%)" : "قيمة الخصم (ريال)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchType === "percentage" && (
            <FormField
              control={form.control}
              name="maxDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحد الأقصى للخصم (ريال)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    اترك 0 لعدم تحديد حد أقصى للخصم
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="applicableTo"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">ينطبق على</FormLabel>
                  <FormDescription>
                    اختر الخدمات التي ينطبق عليها هذا العرض
                  </FormDescription>
                </div>
                {applicableToOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="applicableTo"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
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
            name="usageLimitPerUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأقصى للاستخدام لكل مستخدم</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  اترك 0 لعدم تحديد حد للاستخدام لكل مستخدم
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usageLimitTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأقصى للاستخدام الإجمالي</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  اترك 0 لعدم تحديد حد للاستخدام الإجمالي
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأدنى للشراء (ريال)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  اترك 0 إذا لم يكن هناك حد أدنى للشراء
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">الحالة</FormLabel>
                  <FormDescription>
                    تفعيل أو تعطيل هذا العرض الترويجي
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

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>صورة العرض الترويجي</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    {...field}
                    onChange={(e) => {
                      onChange(e.target.files);
                      handleImageChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  اختر صورة للعرض الترويجي (اختياري)
                </FormDescription>
                <FormMessage />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="h-32 w-auto object-contain rounded border"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          إنشاء العرض الترويجي
        </Button>
      </form>
    </Form>
  );
}
