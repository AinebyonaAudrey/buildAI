import { Syllabus } from '../types';
import BIOLOGY_JSON from './biology.json';
import ENGLISH_JSON from './english.json';
import GENERAL_SCIENCE_JSON from './general-science.json';
import GEOGRAPHY_JSON from './geography.json';
import MATHEMATICS_JSON from './mathematics.json';

export const BIOLOGY_SYLLABUS = BIOLOGY_JSON as unknown as Syllabus;
export const ENGLISH_SYLLABUS = ENGLISH_JSON as unknown as Syllabus;
export const GENERAL_SCIENCE_SYLLABUS = GENERAL_SCIENCE_JSON as unknown as Syllabus;
export const GEOGRAPHY_SYLLABUS = GEOGRAPHY_JSON as unknown as Syllabus;
export const MATHEMATICS_SYLLABUS = MATHEMATICS_JSON as unknown as Syllabus;

export const SYLLABUS_COLLECTION: Record<string, Syllabus> = {
  "Biology": BIOLOGY_SYLLABUS,
  "English": ENGLISH_SYLLABUS,
  "General Science": GENERAL_SCIENCE_SYLLABUS,
  "Geography": GEOGRAPHY_SYLLABUS,
  "Mathematics": MATHEMATICS_SYLLABUS,
};

