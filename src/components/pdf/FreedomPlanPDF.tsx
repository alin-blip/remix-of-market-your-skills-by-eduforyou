import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Roboto font with Romanian diacritics support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Roboto',
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

export interface PdfLabels {
  title: string;
  generatedOn: string;
  personalProfile: string;
  email: string;
  domain: string;
  objectives: string;
  values: string;
  interests: string;
  skills: string;
  ikigaiAnalysis: string;
  ikigaiStatements: string;
  whatYouLove: string;
  whatYoureGoodAt: string;
  whatWorldNeeds: string;
  whatYouCanBePaidFor: string;
  serviceAngles: string;
  serviceOffer: string;
  usp: string;
  targetMarket: string;
  servicePackages: string;
  starterPackage: string;
  standardPackage: string;
  premiumPackage: string;
  price: string;
  pricingJustification: string;
  socialMediaProfiles: string;
  platform: string;
  headline: string;
  bio: string;
  cta: string;
  hashtags: string;
  outreachTemplates: string;
  subject: string;
  footer: string;
}

interface Props {
  data: FreedomPlanData;
  labels: PdfLabels;
}

const toText = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(toText).filter(Boolean).join(', ');
  if (typeof val === 'object') {
    const anyVal = val as any;
    if (typeof anyVal.statement === 'string') return anyVal.statement;
    if (typeof anyVal.title === 'string') return anyVal.title;
    if (typeof anyVal.name === 'string') return anyVal.name;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

const toTextArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val.map(toText).map((s) => s.trim()).filter(Boolean);
};

const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.listItem}>{children}</Text>
  </View>
);

export const FreedomPlanPDF: React.FC<Props> = ({ data, labels }) => (
  <Document>
    {/* Page 1: Cover & Profile */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{labels.title}</Text>
        <Text style={styles.subtitle}>{toText(data.profile.fullName)}</Text>
        <Text style={styles.date}>{labels.generatedOn} {toText(data.generatedAt)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.personalProfile}</Text>
        {toText(data.profile.email) && (
          <View style={styles.row}>
            <Text style={styles.label}>{labels.email}:</Text>
            <Text style={styles.value}>{toText(data.profile.email)}</Text>
          </View>
        )}
        {toText(data.profile.studyField) && (
          <View style={styles.row}>
            <Text style={styles.label}>{labels.domain}:</Text>
            <Text style={styles.value}>{toText(data.profile.studyField)}</Text>
          </View>
        )}

        {toTextArray(data.profile.goals).length > 0 && (
          <>
            <Text style={styles.sectionSubtitle}>{labels.objectives}</Text>
            {toTextArray(data.profile.goals).map((goal, i) => (
              <BulletPoint key={i}>{goal}</BulletPoint>
            ))}
          </>
        )}

        {toTextArray(data.profile.values).length > 0 && (
          <>
            <Text style={styles.sectionSubtitle}>{labels.values}</Text>
            {toTextArray(data.profile.values).map((value, i) => (
              <BulletPoint key={i}>{value}</BulletPoint>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.skills} ({data.skills.length})</Text>
        <View style={styles.skillGrid}>
          {data.skills.map((skill, i) => (
            <View key={i} style={styles.skillBadge}>
              <Text style={styles.skillText}>
                {toText(skill.skill)} ({typeof skill.confidence === 'number' ? skill.confidence : 0}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>

    {/* Page 2: Ikigai */}
    {data.ikigai && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.ikigaiAnalysis}</Text>

          {toTextArray(data.ikigai.ikigaiStatements).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.ikigaiStatements}</Text>
              {toTextArray(data.ikigai.ikigaiStatements).map((statement, i) => (
                <Text key={i} style={styles.paragraph}>
                  {i + 1}. {statement}
                </Text>
              ))}
            </View>
          )}

          {toTextArray(data.ikigai.whatYouLove).length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>{labels.whatYouLove}</Text>
              {toTextArray(data.ikigai.whatYouLove).map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {toTextArray(data.ikigai.whatYoureGoodAt).length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>{labels.whatYoureGoodAt}</Text>
              {toTextArray(data.ikigai.whatYoureGoodAt).map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {toTextArray(data.ikigai.whatWorldNeeds).length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>{labels.whatWorldNeeds}</Text>
              {toTextArray(data.ikigai.whatWorldNeeds).map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {toTextArray(data.ikigai.whatYouCanBePaidFor).length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>{labels.whatYouCanBePaidFor}</Text>
              {toTextArray(data.ikigai.whatYouCanBePaidFor).map((item, i) => (
                <BulletPoint key={i}>{item}</BulletPoint>
              ))}
            </>
          )}

          {toTextArray(data.ikigai.serviceAngles).length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>{labels.serviceAngles}</Text>
              {toTextArray(data.ikigai.serviceAngles).map((angle, i) => (
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
          <Text style={styles.sectionTitle}>{labels.serviceOffer}</Text>

          {toText(data.offer.smv) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.usp}</Text>
              <Text style={styles.cardText}>{toText(data.offer.smv)}</Text>
            </View>
          )}

          {toText(data.offer.targetMarket) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.targetMarket}</Text>
              <Text style={styles.cardText}>{toText(data.offer.targetMarket)}</Text>
            </View>
          )}

          {/* Packages */}
          <Text style={styles.sectionSubtitle}>{labels.servicePackages}</Text>

          {data.offer.starterPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {toText(data.offer.starterPackage.name) || labels.starterPackage}
              </Text>
              {data.offer.starterPackage.price !== undefined && data.offer.starterPackage.price !== null && (
                <Text style={styles.packagePrice}>{toText(data.offer.starterPackage.price)}</Text>
              )}
              {toText(data.offer.starterPackage.description) && (
                <Text style={styles.cardText}>{toText(data.offer.starterPackage.description)}</Text>
              )}
              {toTextArray(data.offer.starterPackage.deliverables).length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {toTextArray(data.offer.starterPackage.deliverables).map((d, i) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {data.offer.standardPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {toText(data.offer.standardPackage.name) || labels.standardPackage}
              </Text>
              {data.offer.standardPackage.price !== undefined && data.offer.standardPackage.price !== null && (
                <Text style={styles.packagePrice}>{toText(data.offer.standardPackage.price)}</Text>
              )}
              {toText(data.offer.standardPackage.description) && (
                <Text style={styles.cardText}>{toText(data.offer.standardPackage.description)}</Text>
              )}
              {toTextArray(data.offer.standardPackage.deliverables).length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {toTextArray(data.offer.standardPackage.deliverables).map((d, i) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {data.offer.premiumPackage && (
            <View style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {toText(data.offer.premiumPackage.name) || labels.premiumPackage}
              </Text>
              {data.offer.premiumPackage.price !== undefined && data.offer.premiumPackage.price !== null && (
                <Text style={styles.packagePrice}>{toText(data.offer.premiumPackage.price)}</Text>
              )}
              {toText(data.offer.premiumPackage.description) && (
                <Text style={styles.cardText}>{toText(data.offer.premiumPackage.description)}</Text>
              )}
              {toTextArray(data.offer.premiumPackage.deliverables).length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {toTextArray(data.offer.premiumPackage.deliverables).map((d, i) => (
                    <BulletPoint key={i}>{d}</BulletPoint>
                  ))}
                </View>
              )}
            </View>
          )}

          {toText(data.offer.pricingJustification) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.pricingJustification}</Text>
              <Text style={styles.cardText}>{toText(data.offer.pricingJustification)}</Text>
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
          <Text style={styles.sectionTitle}>{labels.socialMediaProfiles}</Text>

          {data.socialProfiles.map((profile, i) => {
            const platform = toText(profile.platform);
            const platformLabel = platform
              ? platform.charAt(0).toUpperCase() + platform.slice(1)
              : labels.platform;

            const hashtags = toTextArray((profile as any).hashtags);

            return (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{platformLabel}</Text>

                {toText(profile.headline) && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ ...styles.label, marginBottom: 2 }}>{labels.headline}:</Text>
                    <Text style={styles.cardText}>{toText(profile.headline)}</Text>
                  </View>
                )}

                {toText(profile.bio) && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ ...styles.label, marginBottom: 2 }}>{labels.bio}:</Text>
                    <Text style={styles.cardText}>{toText(profile.bio)}</Text>
                  </View>
                )}

                {toText(profile.cta) && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ ...styles.label, marginBottom: 2 }}>{labels.cta}:</Text>
                    <Text style={styles.cardText}>{toText(profile.cta)}</Text>
                  </View>
                )}

                {hashtags.length > 0 && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ ...styles.label, marginBottom: 2 }}>{labels.hashtags}:</Text>
                    <Text style={styles.cardText}>{hashtags.join(' ')}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}

    {/* Page 5: Outreach Templates */}
    {data.outreachTemplates.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.outreachTemplates}</Text>

          {data.outreachTemplates.slice(0, 4).map((template, i) => {
            const platform = toText(template.platform);
            const platformLabel = platform
              ? platform.charAt(0).toUpperCase() + platform.slice(1)
              : labels.platform;

            return (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {platformLabel} - {toText(template.type)}
                </Text>

                {toText(template.subject) && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ ...styles.label, marginBottom: 2 }}>{labels.subject}:</Text>
                    <Text style={styles.cardText}>{toText(template.subject)}</Text>
                  </View>
                )}

                <Text style={styles.cardText}>{toText(template.content)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>{labels.footer}</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    )}
  </Document>
);
