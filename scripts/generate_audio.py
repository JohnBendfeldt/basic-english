#!/usr/bin/env python3
"""
Audio generation script using Microsoft Edge TTS (en-US-JennyNeural)
Generates high-definition pre-rendered MP3 audio files for all Basic English curriculum
content: Alphabet letters, Phonics examples, Phrases, Numbers & Time, Common Words,
and Quiz audio prompts.
"""

import os
import sys
import json
import asyncio
import re
from pathlib import Path

# Voice configuration
VOICE = "en-US-JennyNeural"
CONCURRENCY_LIMIT = 5
RATE = "+0%"
PITCH = "+0Hz"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_AUDIO_DIR = PROJECT_ROOT / "public" / "audio"
SRC_DATA_DIR = PROJECT_ROOT / "src" / "data"

# Directory mapping
AUDIO_DIRS = {
    "alphabet": PUBLIC_AUDIO_DIR / "alphabet",
    "examples": PUBLIC_AUDIO_DIR / "examples",
    "phrases": PUBLIC_AUDIO_DIR / "phrases",
    "numbers": PUBLIC_AUDIO_DIR / "numbers",
    "words": PUBLIC_AUDIO_DIR / "words",
    "quiz": PUBLIC_AUDIO_DIR / "quiz",
}

def sanitize_slug(text: str) -> str:
    """Convert text to safe lowercase filename slug."""
    s = text.lower()
    # Normalize special characters and contractions
    s = s.replace("...", "")
    s = s.replace("'", "")
    s = s.replace('"', "")
    s = re.sub(r'[^a-z0-9]+', '_', s)
    s = s.strip('_')
    return s

def normalize_text_key(text: str) -> str:
    """Normalize text string for key lookups."""
    s = text.lower().strip()
    s = s.replace("...", "")
    s = re.sub(r'[.,!?;:()\'"]+', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# Comprehensive curriculum data definition
ALPHABET_DATA = [
    ("A", "Apple"),
    ("B", "Book"),
    ("C", "Cat"),
    ("D", "Dog"),
    ("E", "Egg"),
    ("F", "Fish"),
    ("G", "Good"),
    ("H", "House"),
    ("I", "Ice"),
    ("J", "Juice"),
    ("K", "Key"),
    ("L", "Light"),
    ("M", "Milk"),
    ("N", "Name"),
    ("O", "Orange"),
    ("P", "Phone"),
    ("Q", "Quiet"),
    ("R", "Road"),
    ("S", "School"),
    ("T", "Tea"),
    ("U", "Umbrella"),
    ("V", "Voice"),
    ("W", "Water"),
    ("X", "X-ray"),
    ("Y", "Yellow"),
    ("Z", "Zero"),
]

PHRASES_DATA = [
    # Greetings & Introductions
    "Hello",
    "Good morning",
    "Good afternoon",
    "Good evening",
    "How are you?",
    "Nice to meet you",
    "What is your name?",
    "My name is...",
    "My name is",
    "Goodbye",
    "Have a great day",
    # Polite Essentials
    "Please",
    "Thank you very much",
    "You are welcome",
    "Excuse me",
    "I am sorry",
    "Yes",
    "No",
    # Travel & Directions
    "Where is the restroom?",
    "Where is the bus stop?",
    "How do I get to the airport?",
    "Is it far from here?",
    # Dining & Ordering
    "Can I have the check, please?",
    "I would like a coffee, please",
    "A bottle of water, please",
    "How much does this cost?",
    # Communication & Assistance
    "Do you speak English?",
    "Could you speak slower, please?",
    "I do not understand",
    "Could you repeat that, please?",
    "Can you help me?",
]

NUMBERS_DATA = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
    "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety", "One hundred", "One thousand",
    # Time
    "What time is it?",
    "Two o'clock",
    "Half past two",
    "Quarter to three",
]

WORDS_DATA = [
    # Food & Drink
    "Water", "Bread", "Coffee", "Tea", "Food", "Breakfast", "Lunch", "Dinner", "Restaurant",
    # Places & Travel
    "Airport", "Hotel", "Station", "Hospital", "Pharmacy", "Supermarket", "Bank", "City",
    # People & Family
    "Family", "Friend", "Mother", "Father", "Child", "Teacher", "Student",
    # Objects & Everyday Essentials
    "Money", "Ticket", "Passport", "Phone", "Computer", "Book",
    # Core Verbs / Actions
    "To learn", "To speak", "To eat", "To drink", "To go", "To understand",
]

def build_audio_tasks():
    """Build complete list of audio tasks."""
    tasks = []

    # 1. Alphabet letters (spoken as letter name, e.g. "A.")
    for letter, _ in ALPHABET_DATA:
        slug = letter.lower()
        filename = f"{slug}.mp3"
        spoken_text = f"{letter.upper()}."
        tasks.append({
            "category": "alphabet",
            "lookup_key": letter.lower(),
            "display_text": letter,
            "spoken_text": spoken_text,
            "filename": filename,
            "path": f"/audio/alphabet/{filename}",
            "dest_dir": AUDIO_DIRS["alphabet"],
        })

    # 2. Phonics example words
    for letter, word in ALPHABET_DATA:
        slug = sanitize_slug(word)
        filename = f"{slug}.mp3"
        spoken_text = word
        tasks.append({
            "category": "examples",
            "lookup_key": word,
            "display_text": word,
            "spoken_text": spoken_text,
            "filename": filename,
            "path": f"/audio/examples/{filename}",
            "dest_dir": AUDIO_DIRS["examples"],
        })

    # 3. Basic phrases
    for phrase in PHRASES_DATA:
        slug = sanitize_slug(phrase)
        filename = f"{slug}.mp3"
        spoken_text = phrase.replace("...", "")
        tasks.append({
            "category": "phrases",
            "lookup_key": phrase,
            "display_text": phrase,
            "spoken_text": spoken_text,
            "filename": filename,
            "path": f"/audio/phrases/{filename}",
            "dest_dir": AUDIO_DIRS["phrases"],
        })

    # 4. Numbers & Time
    for num in NUMBERS_DATA:
        slug = sanitize_slug(num)
        filename = f"{slug}.mp3"
        spoken_text = num
        tasks.append({
            "category": "numbers",
            "lookup_key": num,
            "display_text": num,
            "spoken_text": spoken_text,
            "filename": filename,
            "path": f"/audio/numbers/{filename}",
            "dest_dir": AUDIO_DIRS["numbers"],
        })

    # 5. Common Words
    for word in WORDS_DATA:
        slug = sanitize_slug(word)
        filename = f"{slug}.mp3"
        spoken_text = word
        tasks.append({
            "category": "words",
            "lookup_key": word,
            "display_text": word,
            "spoken_text": spoken_text,
            "filename": filename,
            "path": f"/audio/words/{filename}",
            "dest_dir": AUDIO_DIRS["words"],
        })

    # 6. Quiz Phonics prompts
    for letter, word in ALPHABET_DATA:
        # Prompt 1: "A. as in Apple"
        text1 = f"{letter}. as in {word}"
        slug1 = f"{letter.lower()}_as_in_{sanitize_slug(word)}"
        filename1 = f"{slug1}.mp3"
        tasks.append({
            "category": "quiz",
            "lookup_key": text1,
            "display_text": text1,
            "spoken_text": f"{letter.upper()}. as in {word}.",
            "filename": filename1,
            "path": f"/audio/quiz/{filename1}",
            "dest_dir": AUDIO_DIRS["quiz"],
        })

        # Prompt 2: "Apple. Letter A."
        text2 = f"{word}. Letter {letter}."
        slug2 = f"{sanitize_slug(word)}_letter_{letter.lower()}"
        filename2 = f"{slug2}.mp3"
        tasks.append({
            "category": "quiz",
            "lookup_key": text2,
            "display_text": text2,
            "spoken_text": f"{word}. Letter {letter.upper()}.",
            "filename": filename2,
            "path": f"/audio/quiz/{filename2}",
            "dest_dir": AUDIO_DIRS["quiz"],
        })

    return tasks

async def generate_single_file(task, semaphore, overwrite=False):
    """Generate a single audio file with retry and semaphore concurrency limit."""
    import edge_tts

    dest_path = task["dest_dir"] / task["filename"]
    if not overwrite and dest_path.exists() and dest_path.stat().st_size > 1000:
        return True, "cached"

    async with semaphore:
        for attempt in range(4):
            try:
                tts = edge_tts.Communicate(
                    text=task["spoken_text"],
                    voice=VOICE,
                    rate=RATE,
                    pitch=PITCH
                )
                await tts.save(str(dest_path))
                if dest_path.exists() and dest_path.stat().st_size > 500:
                    await asyncio.sleep(0.08)  # Prevent socket saturation
                    return True, "generated"
                else:
                    raise IOError("File empty or too small")
            except Exception as e:
                if attempt == 3:
                    print(f"  ❌ FAILED: {task['filename']} ({task['spoken_text']}): {e}", file=sys.stderr)
                    return False, str(e)
                await asyncio.sleep(1.0 * (attempt + 1))

async def main():
    overwrite = "--overwrite" in sys.argv
    print(f"🎵 Initializing English Audio Generator using {VOICE}")
    print(f"   Destination: {PUBLIC_AUDIO_DIR}")
    if overwrite:
        print("   Mode: Overwrite all files")

    # Ensure all directories exist
    for dir_path in AUDIO_DIRS.values():
        dir_path.mkdir(parents=True, exist_ok=True)

    tasks = build_audio_tasks()
    print(f"   Total items to process: {len(tasks)}")

    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

    cached_count = 0
    generated_count = 0
    failed_count = 0

    # Run in parallel with concurrency limit
    batch_tasks = [generate_single_file(t, semaphore, overwrite) for t in tasks]
    results = await asyncio.gather(*batch_tasks)

    for (ok, status) in results:
        if ok:
            if status == "cached":
                cached_count += 1
            else:
                generated_count += 1
        else:
            failed_count += 1

    print(f"\n✅ Generation complete:")
    print(f"   Generated: {generated_count}")
    print(f"   Cached:    {cached_count}")
    print(f"   Failed:    {failed_count}")

    # Build manifest
    text_to_path = {}
    category_map = {cat: {} for cat in AUDIO_DIRS.keys()}

    for t in tasks:
        # Category lookup by sanitized slug and raw key
        cat = t["category"]
        slug = sanitize_slug(t["lookup_key"])
        category_map[cat][slug] = t["path"]
        category_map[cat][t["lookup_key"].lower()] = t["path"]

        # Universal normalized lookup
        norm_key = normalize_text_key(t["lookup_key"])
        if norm_key:
            text_to_path[norm_key] = t["path"]
        
        # Also map spoken text if different
        spoken_norm = normalize_text_key(t["spoken_text"])
        if spoken_norm and spoken_norm not in text_to_path:
            text_to_path[spoken_norm] = t["path"]

    manifest_data = {
        "voice": VOICE,
        "count": len(tasks),
        "textToPath": text_to_path,
        "categoryMap": category_map
    }

    # Save public/audio/manifest.json and public/audio/index.json
    manifest_json_path = PUBLIC_AUDIO_DIR / "manifest.json"
    index_json_path = PUBLIC_AUDIO_DIR / "index.json"
    
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    with open(index_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    # Save src/data/audioManifest.ts for instantaneous synchronous import
    ts_content = f"""/**
 * Pre-rendered audio manifest generated by scripts/generate_audio.py
 * Voice: {VOICE}
 * Total Audio Files: {len(tasks)}
 */

export const AUDIO_VOICE = '{VOICE}';

export const AUDIO_TEXT_MAP: Record<string, string> = {json.dumps(text_to_path, indent=2)};

export const AUDIO_CATEGORY_MAP: Record<string, Record<string, string>> = {json.dumps(category_map, indent=2)};

/**
 * Find pre-rendered audio file for given text and optional category
 */
export function getLocalAudioUrl(text: string, category?: string): string | null {{
  if (!text) return null;

  const normalized = text
    .toLowerCase()
    .replace(/\\.\\.\\./g, '')
    .replace(/[.,!?;:()\\'"]+/g, '')
    .replace(/\\s+/g, ' ')
    .trim();

  // 1. Direct normalized text map lookup
  if (AUDIO_TEXT_MAP[normalized]) {{
    return AUDIO_TEXT_MAP[normalized];
  }}

  // 2. Category-specific lookup
  if (category && AUDIO_CATEGORY_MAP[category]) {{
    const catMap = AUDIO_CATEGORY_MAP[category];
    const slug = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (catMap[slug]) return catMap[slug];
    if (catMap[normalized]) return catMap[normalized];
  }}

  // 3. Fallback search across all categories by slug
  const slug = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  for (const cat of Object.keys(AUDIO_CATEGORY_MAP)) {{
    if (AUDIO_CATEGORY_MAP[cat][slug]) {{
      return AUDIO_CATEGORY_MAP[cat][slug];
    }}
  }}

  return null;
}}

export default getLocalAudioUrl;
"""
    manifest_ts_path = SRC_DATA_DIR / "audioManifest.ts"
    with open(manifest_ts_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"📄 Manifest saved to {manifest_json_path}")
    print(f"📄 TypeScript lookup saved to {manifest_ts_path}")

if __name__ == "__main__":
    asyncio.run(main())
