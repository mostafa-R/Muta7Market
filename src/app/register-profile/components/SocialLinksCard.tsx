import { FiInstagram, FiTwitter, FiPhone, FiYoutube } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";

interface SocialLinksCardProps {
  formik: any;
}

export const SocialLinksCard = ({ formik }: SocialLinksCardProps) => {
  return (
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
            <Label htmlFor="social-twitter" className="flex items-center gap-1">
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
            <Label htmlFor="social-youtube" className="flex items-center gap-1">
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
  );
};
