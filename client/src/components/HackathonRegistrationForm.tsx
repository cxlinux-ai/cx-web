import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, Github, Linkedin, Users, User, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  country: z.string().optional(),
  currentRole: z.enum(["Student", "Professional", "Indie Hacker", "Other"]),
  organization: z.string().optional(),
  githubUrl: z.string()
    .min(1, "GitHub URL is required")
    .refine(
      (url) => url.startsWith("https://github.com/") || url.startsWith("github.com/") || /^[a-zA-Z0-9_-]+$/.test(url),
      "Please enter a valid GitHub URL or username"
    ),
  linkedinUrl: z.string().optional(),
  linuxExperience: z.number().min(1).max(5),
  aiMlExperience: z.number().min(1).max(5),
  programmingLanguages: z.array(z.string()).min(1, "Select at least one programming language"),
  teamOrSolo: z.enum(["team", "solo"]),
  teamName: z.string().optional(),
  projectIdea: z.string().min(10, "Please describe your project idea (at least 10 characters)"),
  usedCortexBefore: z.enum(["yes", "no", "whats_that"]),
  howHeardAboutUs: z.enum(["Twitter", "GitHub", "Discord", "Friend", "Other"]),
});

type FormData = z.infer<typeof formSchema>;

const PROGRAMMING_LANGUAGES = ["Python", "Rust", "Go", "JavaScript", "C/C++", "Other"];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "India", 
  "Brazil", "Australia", "Japan", "South Korea", "China", "Singapore",
  "Netherlands", "Sweden", "Spain", "Italy", "Mexico", "Argentina", "Other"
];

interface HackathonRegistrationFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
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
      country: "",
      currentRole: "Student",
      organization: "",
      githubUrl: "",
      linkedinUrl: "",
      linuxExperience: 3,
      aiMlExperience: 3,
      programmingLanguages: [],
      teamOrSolo: "solo",
      teamName: "",
      projectIdea: "",
      usedCortexBefore: "no",
      howHeardAboutUs: "GitHub",
    },
  });

  const teamOrSolo = form.watch("teamOrSolo");

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
        <p className="text-sm text-gray-500">Check your email for next steps and important updates.</p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a2e] border-white/20">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country} className="text-white hover:bg-white/10">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Current Role <span className="text-red-400">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a2e] border-white/20">
                    <SelectItem value="Student" className="text-white hover:bg-white/10">Student</SelectItem>
                    <SelectItem value="Professional" className="text-white hover:bg-white/10">Professional</SelectItem>
                    <SelectItem value="Indie Hacker" className="text-white hover:bg-white/10">Indie Hacker</SelectItem>
                    <SelectItem value="Other" className="text-white hover:bg-white/10">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Linkedin size={16} /> LinkedIn (Optional)
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="linuxExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Linux Experience (1-5) <span className="text-red-400">*</span></FormLabel>
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
                <FormLabel className="text-gray-300">AI/ML Experience (1-5) <span className="text-red-400">*</span></FormLabel>
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

        <FormField
          control={form.control}
          name="programmingLanguages"
          render={() => (
            <FormItem>
              <FormLabel className="text-gray-300">Programming Languages <span className="text-red-400">*</span></FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <div
                    key={lang}
                    className="flex items-center space-x-2"
                  >
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

        <AnimatePresence>
          {teamOrSolo === "team" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
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

        <FormField
          control={form.control}
          name="projectIdea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Project Idea <span className="text-red-400">*</span></FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe what you want to build with Cortex Linux..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 min-h-[100px] resize-none"
                  data-testid="textarea-project-idea"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="usedCortexBefore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Used Cortex Before? <span className="text-red-400">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-used-cortex">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a2e] border-white/20">
                    <SelectItem value="yes" className="text-white hover:bg-white/10">Yes, I have!</SelectItem>
                    <SelectItem value="no" className="text-white hover:bg-white/10">No, not yet</SelectItem>
                    <SelectItem value="whats_that" className="text-white hover:bg-white/10">What's that?</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="howHeardAboutUs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">How did you hear about us? <span className="text-red-400">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-how-heard">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a2e] border-white/20">
                    <SelectItem value="Twitter" className="text-white hover:bg-white/10">Twitter / X</SelectItem>
                    <SelectItem value="GitHub" className="text-white hover:bg-white/10">GitHub</SelectItem>
                    <SelectItem value="Discord" className="text-white hover:bg-white/10">Discord</SelectItem>
                    <SelectItem value="Friend" className="text-white hover:bg-white/10">Friend / Referral</SelectItem>
                    <SelectItem value="Other" className="text-white hover:bg-white/10">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

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

        <p className="text-xs text-gray-500 text-center">
          By registering, you agree to receive hackathon updates via email and accept our terms of participation.
        </p>
      </form>
    </Form>
  );
}
