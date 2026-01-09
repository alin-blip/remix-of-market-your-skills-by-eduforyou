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
import type { FreedomPlanData } from './FreedomPlanPDF';

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

export const generateFreedomPlanDocx = async (data: FreedomPlanData) => {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Freedom Plan',
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
          text: `Generat pe ${toText(data.generatedAt)}`,
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
  sections.push(createHeading('Profil Personal', HeadingLevel.HEADING_1));

  if (toText(data.profile.email)) {
    sections.push(new Paragraph({ text: `Email: ${toText(data.profile.email)}` }));
  }
  if (toText(data.profile.studyField)) {
    sections.push(new Paragraph({ text: `Domeniu: ${toText(data.profile.studyField)}` }));
  }

  sections.push(...createSection('Obiective', toTextArray(data.profile.goals)));
  sections.push(...createSection('Valori', toTextArray(data.profile.values)));
  sections.push(...createSection('Interese', toTextArray(data.profile.interests)));

  // Skills
  sections.push(createHeading(`Competențe (${data.skills.length})`, HeadingLevel.HEADING_1));
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
    sections.push(createHeading('Analiza Ikigai', HeadingLevel.HEADING_1));
    sections.push(...createSection('Declarații Ikigai', toTextArray(data.ikigai.ikigaiStatements)));
    sections.push(...createSection('Ce Îți Place', toTextArray(data.ikigai.whatYouLove)));
    sections.push(...createSection('La Ce Ești Bun/ă', toTextArray(data.ikigai.whatYoureGoodAt)));
    sections.push(...createSection('Ce Are Nevoie Lumea', toTextArray(data.ikigai.whatWorldNeeds)));
    sections.push(...createSection('Pentru Ce Poți Fi Plătit/ă', toTextArray(data.ikigai.whatYouCanBePaidFor)));
    sections.push(...createSection('Unghiuri de Servicii', toTextArray(data.ikigai.serviceAngles)));
  }

  // Offer
  if (data.offer) {
    sections.push(createHeading('Oferta de Servicii', HeadingLevel.HEADING_1));

    if (toText(data.offer.smv)) {
      sections.push(createHeading('Propunere Unică de Valoare', HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.smv), spacing: { after: 200 } }));
    }

    if (toText(data.offer.targetMarket)) {
      sections.push(createHeading('Piața Țintă', HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.targetMarket), spacing: { after: 200 } }));
    }

    const packages = [
      { label: 'Pachet Starter', pkg: data.offer.starterPackage },
      { label: 'Pachet Standard', pkg: data.offer.standardPackage },
      { label: 'Pachet Premium', pkg: data.offer.premiumPackage },
    ];

    packages.forEach(({ label, pkg }) => {
      if (pkg) {
        sections.push(createHeading(toText(pkg.name) || label, HeadingLevel.HEADING_3));
        if (pkg.price !== undefined && pkg.price !== null) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Preț: ${toText(pkg.price)} ${toText(pkg.currency) || ''}`, bold: true }),
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
      sections.push(createHeading('Justificare Prețuri', HeadingLevel.HEADING_2));
      sections.push(new Paragraph({ text: toText(data.offer.pricingJustification) }));
    }
  }

  // Social Profiles
  if (data.socialProfiles.length > 0) {
    sections.push(createHeading('Profiluri Social Media', HeadingLevel.HEADING_1));

    data.socialProfiles.forEach((profile) => {
      const platform = toText(profile.platform);
      const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Platformă';
      sections.push(createHeading(label, HeadingLevel.HEADING_2));

      if (toText(profile.headline)) {
        sections.push(new Paragraph({ text: `Headline: ${toText(profile.headline)}` }));
      }
      if (toText(profile.bio)) {
        sections.push(new Paragraph({ text: `Bio: ${toText(profile.bio)}` }));
      }
      if (toText(profile.cta)) {
        sections.push(new Paragraph({ text: `CTA: ${toText(profile.cta)}` }));
      }
      const hashtags = toTextArray((profile as any).hashtags);
      if (hashtags.length > 0) {
        sections.push(new Paragraph({ text: `Hashtags: ${hashtags.join(' ')}` }));
      }
    });
  }

  // Outreach Templates
  if (data.outreachTemplates.length > 0) {
    sections.push(createHeading('Template-uri Outreach', HeadingLevel.HEADING_1));

    data.outreachTemplates.slice(0, 6).forEach((template) => {
      const platform = toText(template.platform);
      const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Platformă';
      sections.push(createHeading(`${label} - ${toText(template.type)}`, HeadingLevel.HEADING_2));

      if (toText(template.subject)) {
        sections.push(new Paragraph({ text: `Subiect: ${toText(template.subject)}` }));
      }
      sections.push(new Paragraph({ text: toText(template.content), spacing: { after: 200 } }));
    });
  }

  // Footer
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generat cu Student Freedom • freedom-plan.ro',
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
