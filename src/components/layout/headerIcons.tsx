import {
  MapPin, BarChart3, Star, FileText, Megaphone, Users, BookOpen,
  HelpCircle, Building2, ShoppingBag, Stethoscope, Scale, Zap, Shield,
  Globe, Settings, Mail, Phone, Calendar, Camera, Heart, Target,
  TrendingUp, Award, Briefcase, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  MapPin, BarChart3, Star, FileText, Megaphone, Users, BookOpen,
  HelpCircle, Building2, ShoppingBag, Stethoscope, Scale, Zap, Shield,
  Globe, Settings, Mail, Phone, Calendar, Camera, Heart, Target,
  TrendingUp, Award, Briefcase,
};

export function getIconComponent(name: string | null | undefined): LucideIcon | null {
  if (!name || name === "none") return null;
  return iconMap[name] || null;
}
