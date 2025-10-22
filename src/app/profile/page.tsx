
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).readonly(),
  dashboardName: z.string().min(2, { message: 'Dashboard name must be at least 2 characters.' }),
  phoneNumber: z.string().optional(),
  language: z.enum(['en', 'ne', 'hi']),
});

export default function ProfilePage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      dashboardName: '',
      phoneNumber: '',
      language: 'ne',
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  React.useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          form.reset({
            name: userData.name || '',
            email: userData.email || '',
            dashboardName: userData.dashboardName || '',
            phoneNumber: userData.phoneNumber || '',
            language: userData.language || 'ne',
          });
        }
      });
    }
  }, [user, firestore, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const userDataToUpdate = {
        name: values.name,
        dashboardName: values.dashboardName,
        phoneNumber: values.phoneNumber,
        language: values.language,
      };

      setDocumentNonBlocking(userDocRef, userDataToUpdate, { merge: true });

      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Profile update error', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem updating your profile.',
      });
    }
  }
  
    if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input type="email" placeholder="your.email@example.com" {...field} readOnly disabled />
                    </FormControl>
                    <FormDescription>You cannot change your email address.</FormDescription>
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
                     <FormDescription>This name will be displayed on your dashboard header.</FormDescription>
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
