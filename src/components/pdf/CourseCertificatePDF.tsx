import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts for better styling
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 0,
  },
  container: {
    flex: 1,
    border: '3px solid #f59e0b',
    margin: 30,
    padding: 40,
    position: 'relative',
  },
  borderDecoration: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    border: '1px solid #fbbf24',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#f59e0b',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#6b7280',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  body: {
    alignItems: 'center',
    marginBottom: 20,
  },
  presentedTo: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#6b7280',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  userName: {
    fontSize: 32,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2px solid #f59e0b',
  },
  courseInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  completedText: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#6b7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
    maxWidth: '80%',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  detailItem: {
    alignItems: 'center',
    padding: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#374151',
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
  },
  signatureBlock: {
    alignItems: 'center',
    width: 150,
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1px solid #374151',
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#6b7280',
  },
  signatureName: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#374151',
    marginTop: 5,
  },
  certificateId: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: '#9ca3af',
  },
  badge: {
    position: 'absolute',
    top: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#f59e0b',
    color: '#fff',
    padding: '5px 15px',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

interface CourseCertificatePDFProps {
  userName: string;
  courseTitle: string;
  completedDate: string;
  courseDuration: string;
  lessonsCount: number;
  certificateId: string;
}

export function CourseCertificatePDF({
  userName,
  courseTitle,
  completedDate,
  courseDuration,
  lessonsCount,
  certificateId,
}: CourseCertificatePDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.borderDecoration} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🎓 Freedom Launcher</Text>
            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.subtitle}>Learning Hub Achievement</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.presentedTo}>This certificate is presented to</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.completedText}>For successfully completing the course</Text>
            <Text style={styles.courseTitle}>{courseTitle}</Text>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Completed On</Text>
              <Text style={styles.detailValue}>{completedDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{courseDuration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lessons</Text>
              <Text style={styles.detailValue}>{lessonsCount} Lessons</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Instructor</Text>
              <Text style={styles.signatureName}>Freedom Launcher Team</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Date Issued</Text>
              <Text style={styles.signatureName}>{completedDate}</Text>
            </View>
          </View>

          {/* Certificate ID */}
          <Text style={styles.certificateId}>Certificate ID: {certificateId}</Text>
        </View>
      </Page>
    </Document>
  );
}
