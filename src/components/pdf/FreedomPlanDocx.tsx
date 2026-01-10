import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import type { FreedomPlanData, PdfLabels } from './FreedomPlanPDF';

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

const createBulletParagraph = (text: string) =>
  new Paragraph({
    text: `• ${text}`,
    spacing: { after: 100 },
  });

const createHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) =>
  new Paragraph({
    text,
    heading: level,
    spacing: { before: 300, after: 150 },
  });

const createSection = (title: string, items: string[]) => {
  if (items.length === 0) return [];
  return [
    createHeading(title, HeadingLevel.HEADING_2),
    ...items.map(createBulletParagraph),
  ];
};

export const generateFreedomPlanDocx = async (data: FreedomPlanData, labels: PdfLabels) => {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: labels.title,
          bold: true,
          size: 56,
          color: '1e1b4b',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: toText(data.profile.fullName),
          size: 32,
          color: '6366f1',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${labels.generatedOn} ${toText(data.generatedAt)}`,
          size: 20,
          color: '64748b',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '6366f1' },
      },
    })
  );

  // Profile section
  sections.push(createHeading(labels.personalProfile, HeadingLevel.HEADING_1));

  if (toText(data.profile.email)) {
    sections.push(new Paragraph({ text: `${labels.email}: ${toText(data.profile.email)}` }));
  }
  if (toText(data.profile.studyField)) {
    sections.push(new Paragraph({ text: `${labels.domain}: ${toText(data.profile.studyField)}` }));
  }

  sections.push(...createSection(labels.objectives, toTextArray(data.profile.goals)));
  sections.push(...createSection(labels.values, toTextArray(data.profile.values)));
  sections.push(...createSection(labels.interests, toTextArray(data.profile.interests)));

  // Skills
  sections.push(createHeading(`${labels.skills} (${data.skills.length})`, HeadingLevel.HEADING_1));
  data.skills.forEach((skill) => {
    sections.push(
      new Paragraph({
        text: `• ${toText(skill.skill)} (${skill.confidence || 0}%) - ${toText(skill.category)}`,
        spacing: { after: 80 },
      })
    );
  });

  // Ikigai
  if (data.ikigai) {
    sections.push(createHeading(labels.ikigaiAnalysis, HeadingLevel.HEADING_1));
    sections.push(...createSection(labels.ikigaiStatements, toTextArray(data.ikigai.ikigaiStatements)));
    sections.push(...createSection(labels.whatYouLove, toTextArray(data.ikigai.whatYouLove)));
    sections.push(...createSection(labels.whatYoureGoodAt, toTextArray(data.ikigai.whatYoureGoodAt)));
    sections.push(...createSection(labels.whatWorldNeeds, toTextArray(data.ikigai.whatWorldNeeds)));
    sections.push(...createSection(labels.whatYouCanBePaidFor, toTextArray(data.ikigai.whatYouCanBePaidFor)));
    sections.push(...createSection(labels.serviceAngles, toTextArray(data.ikigai.serviceAngles)));
  }

  // Offer
  if (data.offer) {
    sections.push(createHeading(labels.serviceOffer, HeadingLevel.HEADING_1));

    if (toText(data.offer.smv)) {
      sections.push(createHeading(labels.usp, HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.smv), spacing: { after: 200 } }));
    }

    if (toText(data.offer.targetMarket)) {
      sections.push(createHeading(labels.targetMarket, HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.targetMarket), spacing: { after: 200 } }));
    }

    const packages = [
      { label: labels.starterPackage, pkg: data.offer.starterPackage },
      { label: labels.standardPackage, pkg: data.offer.standardPackage },
      { label: labels.premiumPackage, pkg: data.offer.premiumPackage },
    ];

    packages.forEach(({ label, pkg }) => {
      if (pkg) {
        sections.push(createHeading(toText(pkg.name) || label, HeadingLevel.HEADING_3));
        if (pkg.price !== undefined && pkg.price !== null) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${labels.price}: ${toText(pkg.price)} ${toText(pkg.currency) || ''}`, bold: true }),
              ],
            })
          );
        }
        if (toText(pkg.description)) {
          sections.push(new Paragraph({ text: toText(pkg.description), spacing: { after: 100 } }));
        }
        toTextArray(pkg.deliverables).forEach((d) => {
          sections.push(createBulletParagraph(d));
        });
      }
    });

    if (toText(data.offer.pricingJustification)) {
      sections.push(createHeading(labels.pricingJustification, HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.pricingJustification) }));
    }
  }

  // Social Profiles
  if (data.socialProfiles.length > 0) {
    sections.push(createHeading(labels.socialMediaProfiles, HeadingLevel.HEADING_1));

    data.socialProfiles.forEach((profile) => {
      const platform = toText(profile.platform);
      const platformLabel = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : labels.platform;
      sections.push(createHeading(platformLabel, HeadingLevel.HEADING_2));

      if (toText(profile.headline)) {
        sections.push(new Paragraph({ text: `${labels.headline}: ${toText(profile.headline)}` }));
      }
      if (toText(profile.bio)) {
        sections.push(new Paragraph({ text: `${labels.bio}: ${toText(profile.bio)}` }));
      }
      if (toText(profile.cta)) {
        sections.push(new Paragraph({ text: `${labels.cta}: ${toText(profile.cta)}` }));
      }
      const hashtags = toTextArray((profile as any).hashtags);
      if (hashtags.length > 0) {
        sections.push(new Paragraph({ text: `${labels.hashtags}: ${hashtags.join(' ')}` }));
      }
    });
  }

  // Outreach Templates
  if (data.outreachTemplates.length > 0) {
    sections.push(createHeading(labels.outreachTemplates, HeadingLevel.HEADING_1));

    data.outreachTemplates.slice(0, 6).forEach((template) => {
      const platform = toText(template.platform);
      const platformLabel = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : labels.platform;
      sections.push(createHeading(`${platformLabel} - ${toText(template.type)}`, HeadingLevel.HEADING_2));

      if (toText(template.subject)) {
        sections.push(new Paragraph({ text: `${labels.subject}: ${toText(template.subject)}` }));
      }
      sections.push(new Paragraph({ text: toText(template.content), spacing: { after: 200 } }));
    });
  }

  // Footer
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: labels.footer,
          size: 18,
          color: '94a3b8',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `freedom-plan-${toText(data.profile.fullName).replace(/\s+/g, '-').toLowerCase() || 'export'}.docx`;
  saveAs(blob, fileName);
};
