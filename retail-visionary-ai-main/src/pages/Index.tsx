import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CreativeBuilder } from '@/components/creative-builder/CreativeBuilder';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>AdCraft AI - AI-Powered Retail Media Creative Builder</title>
        <meta 
          name="description" 
          content="Create professional, brand-consistent, retailer-compliant marketing creatives using AI. No design expertise required." 
        />
        <meta name="keywords" content="AI creative builder, retail media, marketing creatives, ad design, brand compliance" />
      </Helmet>
      <CreativeBuilder />
    </>
  );
};

export default Index;
