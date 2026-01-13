import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Document as DocxDocument, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { 
  FileText, 
  Download, 
  Loader2, 
  StickyNote,
  FileType
} from 'lucide-react';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 30,
    color: '#666',
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  noteContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#444',
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#6366f1',
    borderLeftStyle: 'solid',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  noNotes: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 10,
  },
});

interface LessonNote {
  id: string;
  lesson_id: string;
  content: string;
  lesson: {
    title: string;
    position: number;
  };
}

interface NotesExportPDFProps {
  courseTitle: string;
  notes: LessonNote[];
  userName: string;
  exportDate: string;
}

const NotesExportPDF = ({ courseTitle, notes, userName, exportDate }: NotesExportPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>📝 Notițele Mele</Text>
      <Text style={pdfStyles.subtitle}>
        Curs: {courseTitle} | Autor: {userName} | Data: {exportDate}
      </Text>
      
      {notes.length === 0 ? (
        <Text style={pdfStyles.noNotes}>Nu există notițe pentru acest curs.</Text>
      ) : (
        notes.map((note, index) => (
          <View key={note.id}>
            <Text style={pdfStyles.lessonTitle}>
              Lecția {note.lesson.position}: {note.lesson.title}
            </Text>
            <Text style={pdfStyles.noteContent}>{note.content}</Text>
          </View>
        ))
      )}
      
      <Text style={pdfStyles.footer}>
        Generat de Freedom Launcher • {exportDate}
      </Text>
    </Page>
  </Document>
);

interface LessonNotesExportProps {
  courseId: string;
  courseTitle: string;
}

export function LessonNotesExport({ courseId, courseTitle }: LessonNotesExportProps) {
  const { user } = useAuth();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all notes for this course
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['course-notes-export', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get all lessons for this course
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, title, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      // Then get notes for these lessons
      const lessonIds = lessons?.map(l => l.id) || [];
      if (lessonIds.length === 0) return [];
      
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (notesError) throw notesError;
      
      // Combine notes with lesson info
      return (notesData || [])
        .map(note => ({
          ...note,
          lesson: lessons?.find(l => l.id === note.lesson_id) || { title: 'Unknown', position: 0 },
        }))
        .filter(note => note.content && note.content.trim().length > 0)
        .sort((a, b) => a.lesson.position - b.lesson.position) as LessonNote[];
    },
    enabled: !!user?.id && !!courseId,
  });

  const exportDate = new Date().toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const blob = await pdf(
        <NotesExportPDF
          courseTitle={courseTitle}
          notes={notes}
          userName={userProfile?.full_name || 'Student'}
          exportDate={exportDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Notite-${courseTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Notițe exportate ca PDF!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Eroare la exportul PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const docChildren: Paragraph[] = [
        new Paragraph({
          text: '📝 Notițele Mele',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Curs: ${courseTitle}`, color: '666666' }),
            new TextRun({ text: ' | ', color: '666666' }),
            new TextRun({ text: `Autor: ${userProfile?.full_name || 'Student'}`, color: '666666' }),
            new TextRun({ text: ' | ', color: '666666' }),
            new TextRun({ text: `Data: ${exportDate}`, color: '666666' }),
          ],
          spacing: { after: 400 },
        }),
      ];

      if (notes.length === 0) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Nu există notițe pentru acest curs.', italics: true, color: '999999' }),
            ],
          })
        );
      } else {
        notes.forEach(note => {
          docChildren.push(
            new Paragraph({
              text: `Lecția ${note.lesson.position}: ${note.lesson.title}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 },
            }),
            new Paragraph({
              text: note.content,
              spacing: { after: 200 },
            })
          );
        });
      }

      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: docChildren,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Notite-${courseTitle.replace(/\s+/g, '-')}.docx`);

      toast.success('Notițe exportate ca Word!');
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast.error('Eroare la exportul Word');
    } finally {
      setIsExportingDocx(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Exportă Notițele
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Ai {notes.length} {notes.length === 1 ? 'notiță' : 'notițe'} pentru acest curs.
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExportingPdf || isLoading || notes.length === 0}
            className="gap-2 flex-1"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportDocx}
            disabled={isExportingDocx || isLoading || notes.length === 0}
            className="gap-2 flex-1"
          >
            {isExportingDocx ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileType className="h-4 w-4" />
            )}
            Word
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
