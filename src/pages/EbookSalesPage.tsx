import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/lib/auth';
import { Loader2, ShoppingCart, CheckCircle, BookOpen, ArrowRight, Star } from 'lucide-react';

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkoutCourse, isLoading: isCheckoutLoading } = useStripeCheckout();

  // Fetch the ebook product by slug
  const { data: product, isLoading } = useQuery({
    queryKey: ['ebook-product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('product_type', 'ebook')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Check if user has purchased this ebook
  const { data: hasPurchased } = useQuery({
    queryKey: ['ebook-purchase', product?.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !product?.id) return false;
      const { data } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', product.id)
        .eq('status', 'completed')
        .single();
      return !!data;
    },
    enabled: !!user?.id && !!product?.id,
  });

  const handleBuy = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (product?.stripe_price_id) {
      await checkoutCourse(product.id, product.stripe_price_id);
    }
  };

  const handleDownload = () => {
    if (product?.download_url) {
      const link = document.createElement('a');
      link.href = product.download_url;
      link.download = product.download_url.split('/').pop() || 'ebook.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">eBook nu a fost găsit</h1>
          <Button onClick={() => navigate('/learning-hub')}>Înapoi la Learning Hub</Button>
        </div>
      </div>
    );
  }

  const salesContent = product.sales_page_content as Record<string, any> || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Book Cover */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={product.thumbnail_url || '/placeholder.svg'}
                  alt={product.title}
                  className="max-w-[350px] w-full h-auto rounded-lg shadow-2xl"
                />
                <Badge className="absolute -top-4 -right-4 bg-red-500 text-white text-lg px-4 py-2">
                  £{product.price}
                </Badge>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                <BookOpen className="h-4 w-4 mr-2" />
                eBook Digital
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {product.title}
              </h1>
              
              <p className="text-lg text-gray-600">
                {product.description}
              </p>

              {/* Benefits */}
              {salesContent.benefits && (
                <ul className="space-y-3">
                  {(salesContent.benefits as string[]).slice(0, 4).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Ai achiziționat acest eBook</span>
                  </div>
                  <Button size="lg" onClick={handleDownload} className="gap-2">
                    <BookOpen className="h-5 w-5" />
                    Descarcă eBook-ul
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-amber-600">£{product.price}</span>
                    {salesContent.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">£{salesContent.originalPrice}</span>
                    )}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleBuy}
                    disabled={isCheckoutLoading}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8 py-6"
                  >
                    {isCheckoutLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Cumpără Acum
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {salesContent.features && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                Ce vei învăța din acest eBook
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {(salesContent.features as string[]).map((feature, index) => (
                  <Card key={index} className="border-amber-200">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Începe-ți călătoria acum
          </h2>
          <p className="text-gray-600 mb-8">
            Descarcă eBook-ul și aplică strategiile imediat.
          </p>
          {!hasPurchased && (
            <Button 
              size="lg" 
              onClick={handleBuy}
              disabled={isCheckoutLoading}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8 py-6"
            >
              {isCheckoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Obține eBook-ul - £{product.price}
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms and Conditions</a>
          <span>|</span>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
}
