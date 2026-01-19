import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, Github, Linkedin, Users, User, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  discordUsername: z.string()
    .min(2, "Discord username is required")
    .refine(
      (val) => /^[a-zA-Z0-9_.]+$/.test(val),
      "Discord username can only contain letters, numbers, underscores, and dots"
    ),
  country: z.string().optional(),
  organization: z.string().optional(),
  githubUrl: z.string()
    .min(1, "GitHub URL is required")
    .refine(
      (url) => url.startsWith("https://github.com/") || url.startsWith("github.com/") || /^[a-zA-Z0-9_-]+$/.test(url),
      "Please enter a valid GitHub URL (e.g., https://github.com/username)"
    ),
  linkedinUrl: z.string()
    .optional()
    .refine(
      (url) => !url || url === "" || url.includes("linkedin.com/in/") || url.includes("linkedin.com/pub/"),
      "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)"
    ),
  technicalRole: z.string().min(1, "Please select your technical role"),
  technicalRoleOther: z.string().optional(),
  linuxExperience: z.number().min(1).max(5),
  aiMlExperience: z.number().min(1).max(5),
  programmingLanguages: z.array(z.string()).min(1, "Select at least one programming language"),
  whyJoinHackathon: z.array(z.string()).min(1, "Please select at least one reason"),
  whyJoinOther: z.string().optional(),
  cortexAreaInterest: z.string().min(1, "Please select an area of interest"),
  whatExcitesYou: z.string().optional(),
  contributionPlan: z.string().optional(),
  postHackathonInvolvement: z.array(z.string()).optional(),
  threeYearVision: z.string().optional(),
  teamOrSolo: z.enum(["team", "solo"]),
  teamName: z.string().optional(),
  phaseParticipation: z.enum(["phase1", "phase2", "both"]),
});

type FormData = z.infer<typeof formSchema>;

const PROGRAMMING_LANGUAGES = ["Python", "Rust", "Go", "JavaScript/TypeScript", "C/C++", "Other"];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "India", 
  "Brazil", "Australia", "Japan", "South Korea", "China", "Singapore",
  "Netherlands", "Sweden", "Spain", "Italy", "Mexico", "Argentina", "Other"
];

const TECHNICAL_ROLES = [
  { value: "backend", label: "Backend / Systems" },
  { value: "frontend", label: "Frontend" },
  { value: "ml_ai", label: "ML / AI" },
  { value: "devops", label: "DevOps / Infra" },
  { value: "security", label: "Security" },
  { value: "research", label: "Research" },
  { value: "student", label: "Student / Learning" },
  { value: "other", label: "Other" },
];

const WHY_JOIN_OPTIONS = [
  { value: "learn_linux", label: "Learn systems / Linux internals" },
  { value: "build_meaningful", label: "Build something meaningful" },
  { value: "contribute", label: "Contribute to the ecosystem" },
  { value: "compete_prizes", label: "Compete & win prizes" },
  { value: "career_growth", label: "Get noticed / career growth" },
  { value: "ai_os_curiosity", label: "Curiosity about AI + OS" },
  { value: "other", label: "Other" },
];

const CORTEX_AREAS = [
  { value: "ai_native", label: "AI-native OS features" },
  { value: "dev_tooling", label: "Developer tooling" },
  { value: "performance", label: "Performance / kernel work" },
  { value: "security", label: "Security / isolation" },
  { value: "enterprise", label: "Enterprise features" },
  { value: "docs_ecosystem", label: "Documentation / ecosystem" },
];

const POST_HACKATHON_OPTIONS = [
  { value: "continue_contributing", label: "Continue contributing" },
  { value: "future_hackathons", label: "Join future hackathons" },
  { value: "beta_tester", label: "Early access / beta tester" },
  { value: "paid_contributor", label: "Paid contributor / contractor" },
  { value: "full_time", label: "Full-time role (future)" },
  { value: "community", label: "Community only" },
];

const PHASE_OPTIONS = [
  { value: "both", label: "Both phases", description: "Ideathon + Hackathon (recommended)" },
  { value: "phase1", label: "Phase 1 only", description: "Ideathon (Weeks 1-4)" },
  { value: "phase2", label: "Phase 2 only", description: "Hackathon (Weeks 9-17)" },
];

interface HackathonRegistrationFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

function SectionHeader({ number, title, subtitle, optional }: { number: number; title: string; subtitle?: string; optional?: boolean }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-sm">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {title}
          {optional && <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded">(Optional)</span>}
        </h3>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-white/10 my-8" />;
}

export default function HackathonRegistrationForm({ onSuccess, onClose }: HackathonRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      discordUsername: "",
      country: "",
      organization: "",
      githubUrl: "",
      linkedinUrl: "",
      technicalRole: "",
      technicalRoleOther: "",
      linuxExperience: 3,
      aiMlExperience: 3,
      programmingLanguages: [],
      whyJoinHackathon: [],
      whyJoinOther: "",
      cortexAreaInterest: "",
      whatExcitesYou: "",
      contributionPlan: "",
      postHackathonInvolvement: [],
      threeYearVision: "",
      teamOrSolo: "solo",
      teamName: "",
      phaseParticipation: "both",
    },
  });

  const teamOrSolo = form.watch("teamOrSolo");
  const technicalRole = form.watch("technicalRole");
  const whyJoinHackathon = form.watch("whyJoinHackathon");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Already Registered",
            description: result.error || "This email is already registered for the hackathon.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: result.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      setIsSuccess(true);
      toast({
        title: "Registration Successful!",
        description: "Welcome to the Cortex Linux Hackathon. Check your email for next steps.",
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageToggle = (language: string, checked: boolean) => {
    const current = form.getValues("programmingLanguages");
    if (checked) {
      form.setValue("programmingLanguages", [...current, language]);
    } else {
      form.setValue("programmingLanguages", current.filter(l => l !== language));
    }
    form.trigger("programmingLanguages");
  };

  const handleWhyJoinToggle = (value: string, checked: boolean) => {
    const current = form.getValues("whyJoinHackathon");
    if (checked) {
      form.setValue("whyJoinHackathon", [...current, value]);
    } else {
      form.setValue("whyJoinHackathon", current.filter(v => v !== value));
    }
    form.trigger("whyJoinHackathon");
  };

  const handlePostHackathonToggle = (value: string, checked: boolean) => {
    const current = form.getValues("postHackathonInvolvement") || [];
    if (checked) {
      form.setValue("postHackathonInvolvement", [...current, value]);
    } else {
      form.setValue("postHackathonInvolvement", current.filter(v => v !== value));
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">You're Registered!</h3>
        <p className="text-gray-400 mb-4">Welcome to the Cortex Linux Hackathon 2026</p>
        
        <div className="bg-gradient-to-r from-[#5865F2]/20 to-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl p-6 mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageCircle className="w-6 h-6 text-[#5865F2]" />
            <h4 className="text-lg font-semibold text-white">Join Our Discord</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Stay updated on hackathon news, connect with other participants, find teammates, and get support from the community.
          </p>
          <a
            href="https://discord.gg/ASvzWcuTfk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            data-testid="button-join-discord"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord Server
          </a>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          We'll also send updates to your email. See you at the hackathon!
        </p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        
        {/* SECTION 1: Identity & Contact */}
        <SectionHeader 
          number={1} 
          title="Your Information" 
          subtitle="Let us know who you are"
        />
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Full Name <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your full name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      data-testid="input-fullname"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discordUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <MessageCircle size={16} className="text-[#5865F2]" /> Discord Username <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="username#1234 or username"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      data-testid="input-discord"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Country</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-11 sm:h-9 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                      data-testid="select-country"
                    >
                      <option value="" className="bg-[#1a1a2e] text-gray-400">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country} className="bg-[#1a1a2e] text-white">
                          {country}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Organization (School/Company)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Where do you work or study?"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                    data-testid="input-organization"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <SectionDivider />

        {/* SECTION 2: Technical Profile */}
        <SectionHeader 
          number={2} 
          title="Technical Background" 
          subtitle="Help us understand your skills"
        />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <Github size={16} /> GitHub <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://github.com/username"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      data-testid="input-github"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <Linkedin size={16} /> LinkedIn
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                      data-testid="input-linkedin"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="technicalRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Primary Technical Role <span className="text-red-400">*</span></FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-11 sm:h-9 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                    data-testid="select-technical-role"
                  >
                    <option value="" className="bg-[#1a1a2e] text-gray-400">Select your primary role</option>
                    {TECHNICAL_ROLES.map((role) => (
                      <option key={role.value} value={role.value} className="bg-[#1a1a2e] text-white">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {technicalRole === "other" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="technicalRoleOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Describe your role</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="What best describes your technical focus?"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                          data-testid="input-role-other"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <FormField
            control={form.control}
            name="programmingLanguages"
            render={() => (
              <FormItem>
                <FormLabel className="text-gray-300">Programming Languages <span className="text-red-400">*</span></FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={form.watch("programmingLanguages").includes(lang)}
                        onCheckedChange={(checked) => handleLanguageToggle(lang, checked === true)}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        data-testid={`lang-${lang.toLowerCase().replace(/[^a-z]/g, '')}`}
                      />
                      <Label htmlFor={`lang-${lang}`} className="text-sm text-gray-300 cursor-pointer">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="linuxExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Linux Experience <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <div className="flex gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={`w-10 h-10 rounded-lg border transition-all ${
                            field.value === level 
                              ? "bg-blue-500 border-blue-400 text-white" 
                              : "bg-white/5 border-white/20 text-gray-400 hover:border-blue-400"
                          }`}
                          data-testid={`linux-exp-${level}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">1 = Beginner, 5 = Expert</p>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiMlExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">AI/ML Experience <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <div className="flex gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={`w-10 h-10 rounded-lg border transition-all ${
                            field.value === level 
                              ? "bg-blue-500 border-blue-400 text-white" 
                              : "bg-white/5 border-white/20 text-gray-400 hover:border-blue-400"
                          }`}
                          data-testid={`aiml-exp-${level}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">1 = Beginner, 5 = Expert</p>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <SectionDivider />

        {/* SECTION 3: Participation */}
        <SectionHeader 
          number={3} 
          title="Participation Style" 
          subtitle="How do you want to compete?"
        />

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="phaseParticipation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Which phase(s) do you want to participate in? <span className="text-red-400">*</span></FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-3 pt-2"
                  >
                    {PHASE_OPTIONS.map((phase) => (
                      <div key={phase.value} className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value={phase.value} 
                          id={`phase-${phase.value}`} 
                          className="border-white/30 text-blue-500 mt-0.5" 
                          data-testid={`radio-phase-${phase.value}`} 
                        />
                        <Label htmlFor={`phase-${phase.value}`} className="flex flex-col cursor-pointer">
                          <span className="text-gray-300">{phase.label}</span>
                          <span className="text-xs text-gray-500">{phase.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamOrSolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Team or Solo? <span className="text-red-400">*</span></FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="solo" id="solo" className="border-white/30 text-blue-500" data-testid="radio-solo" />
                      <Label htmlFor="solo" className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <User size={16} /> Solo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="team" id="team" className="border-white/30 text-blue-500" data-testid="radio-team" />
                      <Label htmlFor="team" className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <Users size={16} /> Team
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {teamOrSolo === "team" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Team Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Your team name"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                          data-testid="input-teamname"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SectionDivider />

        {/* SECTION 4: Motivations */}
        <SectionHeader 
          number={4} 
          title="Your Motivations" 
          subtitle="What brings you to this hackathon?"
        />

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="whyJoinHackathon"
            render={() => (
              <FormItem>
                <FormLabel className="text-gray-300">Why did you join this hackathon? <span className="text-red-400">*</span></FormLabel>
                <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WHY_JOIN_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`why-${option.value}`}
                        checked={form.watch("whyJoinHackathon").includes(option.value)}
                        onCheckedChange={(checked) => handleWhyJoinToggle(option.value, checked === true)}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        data-testid={`why-${option.value}`}
                      />
                      <Label htmlFor={`why-${option.value}`} className="text-sm text-gray-300 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {whyJoinHackathon.includes("other") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="whyJoinOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Tell us more</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="What's your other reason?"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500"
                          data-testid="input-why-other"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <FormField
            control={form.control}
            name="cortexAreaInterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Which Cortex Linux area interests you most? <span className="text-red-400">*</span></FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-11 sm:h-9 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                    data-testid="select-cortex-area"
                  >
                    <option value="" className="bg-[#1a1a2e] text-gray-400">Select an area</option>
                    {CORTEX_AREAS.map((area) => (
                      <option key={area.value} value={area.value} className="bg-[#1a1a2e] text-white">
                        {area.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <SectionDivider />

        {/* SECTION 5: Your Vision (Optional) */}
        <SectionHeader 
          number={5} 
          title="Your Vision" 
          subtitle="Help us understand your ideas"
          optional
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="whatExcitesYou"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">What excites you most about Cortex Linux?</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share what draws you to this project..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 min-h-[80px] resize-none"
                    data-testid="textarea-excites"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contributionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">What do you plan to build or contribute?</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Idea, feature, tooling, infra, docs, research, etc. It's okay if this is rough or exploratory."
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 min-h-[80px] resize-none"
                    data-testid="textarea-contribution"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <SectionDivider />

        {/* SECTION 6: Post-Hackathon (Optional) */}
        <SectionHeader 
          number={6} 
          title="Beyond the Hackathon" 
          subtitle="Help us shape the future of Cortex Linux"
          optional
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="postHackathonInvolvement"
            render={() => (
              <FormItem>
                <FormLabel className="text-gray-300">How would you like to stay involved after the hackathon?</FormLabel>
                <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POST_HACKATHON_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`post-${option.value}`}
                        checked={(form.watch("postHackathonInvolvement") || []).includes(option.value)}
                        onCheckedChange={(checked) => handlePostHackathonToggle(option.value, checked === true)}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        data-testid={`post-${option.value}`}
                      />
                      <Label htmlFor={`post-${option.value}`} className="text-sm text-gray-300 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="threeYearVision"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">If Cortex Linux succeeds in 3 years, what do you hope it becomes?</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share your vision for the future of Cortex Linux..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 min-h-[80px] resize-none"
                    data-testid="textarea-vision"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-14 text-base rounded-xl"
            data-testid="button-submit-registration"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register for Hackathon
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
