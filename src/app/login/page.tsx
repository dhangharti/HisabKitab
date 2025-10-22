'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, initiateEmailSignUp } from '@/firebase';
import Link from 'next/link';
import { INITIAL_DATA } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  dashboardName: z.string().min(2, { message: 'Dashboard name must be at least 2 characters.' }),
  phoneNumber: z.string().optional(),
  familyGroupId: z.string().optional(),
  language: z.enum(['en', 'ne', 'hi']),
  financeOption: z.enum(['50/40/10', 'flexible']),
});

export default function SignUpPage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dashboardName: '',
      phoneNumber: '',
      familyGroupId: '',
      language: 'ne',
      financeOption: '50/40/10',
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && user) {
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser && firestore) {
          const values = form.getValues();
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userData = {
            id: currentUser.uid,
            email: values.email,
            name: values.name,
            dashboardName: values.dashboardName,
            phoneNumber: values.phoneNumber,
            familyGroupId: values.familyGroupId,
            language: values.language,
            financeOption: values.financeOption,
          };
          setDocumentNonBlocking(userDocRef, userData, { merge: true });

          // Create the initial data document for the user
          const dataDocRef = doc(firestore, 'user_data', currentUser.uid);
          setDocumentNonBlocking(dataDocRef, INITIAL_DATA);

          toast({
            title: 'Account Created!',
            description: "You've been successfully signed up.",
          });
          router.push('/');
        }
      });
      return () => unsubscribe();
    }
  }, [user, isUserLoading, router, auth, firestore, form, toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    try {
      initiateEmailSignUp(auth, values.email, values.password);
    } catch (error: any) {
      console.error('Sign up error', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'There was a problem with your registration.',
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dashboardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dashboard Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., My Family's Budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+977..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="familyGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Group Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code to join a group" {...field} />
                    </FormControl>
                    <FormDescription>
                      If you have a family group code, enter it here to join.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ne">नेपाली</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="financeOption"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Finance Management Style</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="50/40/10" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            50/40/10 Rule (Needs/Investments/Wants)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="flexible" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Flexible (Manual Tracking)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
