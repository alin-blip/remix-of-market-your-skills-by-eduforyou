import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Download, CheckCircle } from 'lucide-react';

export default function SqueezePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch the free product by slug
  const { data: product, isLoading } = useQuery({
    queryKey: ['squeeze-product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('product_type', 'free_report')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Te rog introdu email-ul');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save lead to database
      const { error } = await supabase.from('leads').insert({
        email,
        name: name || null,
        product_id: product?.id,
        funnel_id: product?.funnel_id,
        source: 'squeeze_page',
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Mulțumim! Descarcă raportul gratuit.');

      // Trigger PDF download
      if (product?.download_url) {
        const link = document.createElement('a');
        link.href = product.download_url;
        link.download = product.download_url.split('/').pop() || 'report.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Eroare la trimitere. Te rog încearcă din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eeeeee]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eeeeee]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pagina nu a fost găsită</h1>
          <Button onClick={() => navigate('/learning-hub')}>Înapoi la Learning Hub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeeeee]">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-red-600 text-3xl md:text-4xl font-bold tracking-wide mb-2">
              FREE SPECIAL REPORT
            </h1>
          </div>

          {/* Two Column Layout */}
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Column - Cover Image */}
              <div className="flex justify-center">
                <img
                  src={product.thumbnail_url || '/funnels/fiverr/cover.png'}
                  alt={product.title}
                  className="max-w-[300px] w-full h-auto shadow-lg"
                />
              </div>

              {/* Right Column - Form */}
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
                  {product.title}
                </h2>
                
                <p className="text-gray-600 text-center md:text-left">
                  {product.description || 'Get my free eBook just by entering your details below'}
                </p>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name:
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-white border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email:
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                        className="w-full bg-white border-gray-300"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg rounded-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          CLICK HERE TO DOWNLOAD
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 py-6">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Mulțumim!</h3>
                    <p className="text-gray-600">
                      Raportul tău gratuit se descarcă acum.
                    </p>
                    {product.download_url && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = product.download_url!;
                          link.download = product.download_url!.split('/').pop() || 'report.pdf';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Descarcă din nou
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-8 space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Disclaimer</a>
            <span>|</span>
            <a href="#" className="hover:underline">Terms and Conditions</a>
            <span>|</span>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
