"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '~/util/supabase/client';
import OnboardingModal from './OnboardingModal';
import { checkUserOnboardingNeeded } from '~/app/actions/CheckOnboardingNeeded'; // Adjust the import path as necessary

const UserOnboardingCheck = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const fetchUserAndCheckOnboarding = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.error('User not authenticated');
        return;
      }

      try {
        const onboardingNeeded = await checkUserOnboardingNeeded(data.user.id);
        setNeedsOnboarding(onboardingNeeded);
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };

    fetchUserAndCheckOnboarding();
  }, []);

  if (!needsOnboarding) {
    return null;
  }

  return <OnboardingModal userId={supabase.auth.user()?.id} />;
};

export default UserOnboardingCheck;
