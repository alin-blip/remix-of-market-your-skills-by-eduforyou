import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Note: @react-pdf/renderer already supports standard fonts like Helvetica.
// Registering fonts with src="Helvetica" can crash in some environments.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
    marginBottom: 4,
    paddingLeft: 12,
  },
  bullet: {
    marginRight: 6,
    color: '#6366f1',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    width: 100,
  },
  value: {
    fontSize: 10,
    color: '#334155',
    flex: 1,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#eef2ff',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 9,
    color: '#4338ca',
  },
  packageCard: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 11,
    color: '#1e1b4b',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#94a3b8',
  },
});

export interface FreedomPlanData {
  profile: {
    fullName: string;
    email: string;
    studyField: string;
    goals: string[];
    values: string[];
    interests: string[];
  };
  skills: Array<{
    skill: string;
    category: string;
    confidence: number;
    description?: string;
  }>;
  ikigai: {
    whatYouLove: string[];
    whatYoureGoodAt: string[];
    whatWorldNeeds: string[];
    whatYouCanBePaidFor: string[];
    ikigaiStatements: string[];
    serviceAngles: string[];
  } | null;
  offer: {
    smv: string;
    targetMarket: string;
    starterPackage: any;
    standardPackage: any;
    premiumPackage: any;
    pricingJustification: string;
  } | null;
  socialProfiles: Array<{
    platform: string;
    bio: string;
    headline: string;
    about: string;
    hashtags: string[];
    contentPillars: string[];
    cta: string;
  }>;
  outreachTemplates: Array<{
    platform: string;
    type: string;
    subject: string;
    content: string;
  }>;
  generatedAt: string;
}

interface Props {
  data: FreedomPlanData;
}

const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.listItem}>{children}</Text>
  </View>
);

export const FreedomPlanPDF: React.FC<Props> = ({ data }) => (
  <Document>
    {/* Page 1: Cover & Profile */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Freedom Plan</Text>
        <Text style={styles.subtitle}>{data.profile.fullName}</Text>
        <Text style={styles.date}>Generat pe {data.generatedAt}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil Personal</Text>
        {data.profile.email && (
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.profile.email}</Text>
          </View>
        )}
        {data.profile.studyField && (
          <View style={styles.row}>
            <Text style={styles.label}>Domeniu:</Text>
            <Text style={styles.value}>{data.profile.studyField}</Text>
          </View>
        )}
        
        {data.profile.goals.length > 0 && (
          <>
            <Text style={styles.sectionSubtitle}>Obiective</Text>
            {data.profile.goals.map((goal, i) => (
              <BulletPoint key={i}>{goal}</BulletPoint>
            ))}
          </>
        )}

        {data.profile.values.length > 0 && (
          <>
            <Text style={styles.sectionSubtitle}>Valori</Text>
            {data.profile.values.map((value, i) => (
              <BulletPoint key={i}>{value}</BulletPoint>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competențe ({data.skills.length})</Text>
        <View style={styles.skillGrid}>
          {data.skills.map((skill, i) => (
            <View key={i} style={styles.skillBadge}>
              <Text style={styles.skillText}>
                {skill.skill} ({skill.confidence}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>

    {/* Page 2: Ikigai */}
    {data.ikigai && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analiza Ikigai</Text>

          {data.ikigai.ikigaiStatements.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Declarații Ikigai</Text>
              {data.ikigai.ikigaiStatements.map((statement, i) => (
                <Text key={i} style={styles.paragraph}>{i + 1}. {statement}</Text>
              ))}
            </View>
          )}

          {data.ikigai.whatYouLove.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Ce Îți Place</Text>
              {data.ikigai.whatYouLove.map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {data.ikigai.whatYoureGoodAt.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>La Ce Ești Bun/ă</Text>
              {data.ikigai.whatYoureGoodAt.map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {data.ikigai.whatWorldNeeds.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Ce Are Nevoie Lumea</Text>
              {data.ikigai.whatWorldNeeds.map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {data.ikigai.whatYouCanBePaidFor.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Pentru Ce Poți Fi Plătit/ă</Text>
              {data.ikigai.whatYouCanBePaidFor.map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {data.ikigai.serviceAngles.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Unghiuri de Servicii</Text>
              {data.ikigai.serviceAngles.map((angle, i) => (
                <BulletPoint key={i}>{angle}</BulletPoint>
              ))}
            </>
          )}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}

    {/* Page 3: Offer */}
    {data.offer && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oferta de Servicii</Text>

          {data.offer.smv && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Propunere Unică de Valoare (USP)</Text>
              <Text style={styles.cardText}>{data.offer.smv}</Text>
            </View>
          )}

          {data.offer.targetMarket && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Piața Țintă</Text>
              <Text style={styles.cardText}>{data.offer.targetMarket}</Text>
            </View>
          )}

          {/* Packages */}
          <Text style={styles.sectionSubtitle}>Pachete de Servicii</Text>

          {data.offer.starterPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {data.offer.starterPackage.name || 'Pachet Starter'}
              </Text>
              {data.offer.starterPackage.price && (
                <Text style={styles.packagePrice}>{data.offer.starterPackage.price}</Text>
              )}
              {data.offer.starterPackage.description && (
                <Text style={styles.cardText}>{data.offer.starterPackage.description}</Text>
              )}
              {data.offer.starterPackage.deliverables && (
                <View style={{ marginTop: 6 }}>
                  {(data.offer.starterPackage.deliverables as string[]).map((d: string, i: number) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {data.offer.standardPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {data.offer.standardPackage.name || 'Pachet Standard'}
              </Text>
              {data.offer.standardPackage.price && (
                <Text style={styles.packagePrice}>{data.offer.standardPackage.price}</Text>
              )}
              {data.offer.standardPackage.description && (
                <Text style={styles.cardText}>{data.offer.standardPackage.description}</Text>
              )}
              {data.offer.standardPackage.deliverables && (
                <View style={{ marginTop: 6 }}>
                  {(data.offer.standardPackage.deliverables as string[]).map((d: string, i: number) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {data.offer.premiumPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {data.offer.premiumPackage.name || 'Pachet Premium'}
              </Text>
              {data.offer.premiumPackage.price && (
                <Text style={styles.packagePrice}>{data.offer.premiumPackage.price}</Text>
              )}
              {data.offer.premiumPackage.description && (
                <Text style={styles.cardText}>{data.offer.premiumPackage.description}</Text>
              )}
              {data.offer.premiumPackage.deliverables && (
                <View style={{ marginTop: 6 }}>
                  {(data.offer.premiumPackage.deliverables as string[]).map((d: string, i: number) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {data.offer.pricingJustification && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Justificare Prețuri</Text>
              <Text style={styles.cardText}>{data.offer.pricingJustification}</Text>
            </View>
          )}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}

    {/* Page 4: Social Profiles */}
    {data.socialProfiles.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profiluri Social Media</Text>

          {data.socialProfiles.map((profile, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>
                {profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)}
              </Text>
              
              {profile.headline && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ ...styles.label, marginBottom: 2 }}>Headline:</Text>
                  <Text style={styles.cardText}>{profile.headline}</Text>
                </View>
              )}
              
              {profile.bio && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ ...styles.label, marginBottom: 2 }}>Bio:</Text>
                  <Text style={styles.cardText}>{profile.bio}</Text>
                </View>
              )}
              
              {profile.cta && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ ...styles.label, marginBottom: 2 }}>CTA:</Text>
                  <Text style={styles.cardText}>{profile.cta}</Text>
                </View>
              )}

              {profile.hashtags.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ ...styles.label, marginBottom: 2 }}>Hashtags:</Text>
                  <Text style={styles.cardText}>{profile.hashtags.join(' ')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}

    {/* Page 5: Outreach Templates */}
    {data.outreachTemplates.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template-uri Outreach</Text>

          {data.outreachTemplates.slice(0, 4).map((template, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>
                {template.platform.charAt(0).toUpperCase() + template.platform.slice(1)} - {template.type}
              </Text>
              
              {template.subject && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ ...styles.label, marginBottom: 2 }}>Subiect:</Text>
                  <Text style={styles.cardText}>{template.subject}</Text>
                </View>
              )}
              
              <Text style={styles.cardText}>{template.content}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generat cu Student Freedom • freedom-plan.ro</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}
  </Document>
);
