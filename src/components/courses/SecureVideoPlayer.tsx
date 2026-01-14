import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecureVideoPlayerProps {
  videoStoragePath: string | null;
  videoUrl?: string | null;
  hasAccess: boolean;
  lessonTitle?: string;
  onComplete?: () => void;
}

export function SecureVideoPlayer({
  videoStoragePath,
  videoUrl,
  hasAccess,
  lessonTitle,
  onComplete,
}: SecureVideoPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasWatched, setHasWatched] = useState(false);

  useEffect(() => {
    if (videoStoragePath && hasAccess) {
      loadSignedUrl();
    }
  }, [videoStoragePath, hasAccess]);

  const loadSignedUrl = async () => {
    if (!videoStoragePath) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signError } = await supabase.storage
        .from('course-videos')
        .createSignedUrl(videoStoragePath, 14400); // 4 hours expiry

      if (signError) throw signError;
      if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
      }
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Nu s-a putut încărca videoul. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => {
    if (!hasWatched) {
      setHasWatched(true);
      onComplete?.();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !hasWatched) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (progress >= 90) {
        setHasWatched(true);
        onComplete?.();
      }
    }
  };

  // If there's an external video URL (YouTube/Vimeo), use iframe
  if (videoUrl && !videoStoragePath) {
    const embedUrl = getEmbedUrl(videoUrl);
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // No access - show locked state
  if (!hasAccess) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Cumpără cursul pentru a accesa acest video
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadSignedUrl} className="mt-4">
          Încearcă din nou
        </Button>
      </div>
    );
  }

  // No video available
  if (!signedUrl && !videoUrl) {
    return (
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Video indisponibil</p>
        </div>
      </div>
    );
  }

  // Render video player
  return (
    <div 
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click
    >
      <video
        ref={videoRef}
        src={signedUrl || undefined}
        className="w-full h-full"
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        playsInline
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
      
      {/* Watermark overlay - optional */}
      {/* <div className="absolute bottom-20 right-4 text-white/30 text-sm pointer-events-none select-none">
        {userEmail}
      </div> */}
    </div>
  );
}

// Helper to convert YouTube/Vimeo URLs to embed URLs
function getEmbedUrl(url: string): string {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}

export default SecureVideoPlayer;
