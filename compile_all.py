# compile_all.py
import json
import re
from chapters_1_to_9 import laws_1_to_9
from chapters_10_to_18 import laws_10_to_18
from chapters_19_to_27 import laws_19_to_27
from build_chapters_data import intro_data
from create_dataset import glossary_list

all_laws = laws_1_to_9 + laws_10_to_18 + laws_19_to_27

print(f"Total laws assembled: {len(all_laws)}")

# Add extra pedagogical info to words
# Confusable pairs noted in book
confusable_notes = {
    "disinterested": "Note distinction: disinterested means impartial and unbiased. Uninterested means not interested or bored.",
    "ingenuous": "Note distinction: ingenuous means innocent, candid, naive. Disingenuous means pretending to be sincere when not.",
    "discrete": "Note distinction: discrete (with 'ete') means separate and distinct. Discreet (with 'eet') means careful, cautious, secretive.",
    "enervate": "Note distinction: enervate means to drain of energy/exhaust (opposite of energize!).",
    "strut": "Dual meaning: 1. A proud, pompous walk. 2. A structural supporting bar/brace (both appear in Law 27!).",
    "secrete": "Dual meaning: 1. To hide away secretly. 2. In biology, to produce and release a substance (both appear in Law 23!).",
    "sanction": "Contronym / Dual meaning: 1. Official permission or approval. 2. A punitive penalty (both appear in Law 11!).",
    "flag": "Dual meaning: 1. To mark or call attention to. 2. To tire, weaken, or decline in vigor (both appear in Law 24!)."
}

# Map words to their occurrences in the text
word_examples = {}
for law in all_laws:
    law_num = law["law"]
    for sec_id, sec_text in law["sections"].items():
        sentences = re.split(r'(?<=[.?!])\s+', sec_text)
        for sent in sentences:
            for word in law["words"]:
                # Match word root/stem or whole word case-insensitively
                pattern = r'\b' + re.escape(word) + r'\b'
                if re.search(pattern, sent, re.IGNORECASE):
                    if word not in word_examples:
                        word_examples[word] = []
                    if len(word_examples[word]) < 3:
                        word_examples[word].append({
                            "sentence": sent.strip(),
                            "section": sec_id,
                            "law": law_num
                        })

# Merge glossary with enrichments
enriched_glossary = []
seen_words = set()

# In the book, strut is listed twice
for g in glossary_list:
    w = g["word"]
    item = {
        "word": w,
        "definition": g["definition"],
        "law": g["law"],
        "examples": [e["sentence"] for e in word_examples.get(w, [])],
        "confusable": confusable_notes.get(w, None)
    }
    enriched_glossary.append(item)

# Also check for words that might have multiple definitions (strut)
# Let's ensure both entries of strut exist or strut notes both
for item in enriched_glossary:
    if item["word"] == "strut":
        item["dual_meaning"] = True

# Also ensure metadata
metadata = {
    "bookTitle": "The Price of Influence: 27 Laws of Judgment",
    "subtitle": "A story of power and trust",
    "author": "Gradify Vocabulary Series",
    "totalWords": 333,
    "totalLaws": 27,
    "intro": intro_data,
    "epilogue": {
        "title": "After the last law",
        "text": """The city did not become fair forever. A later council would make different mistakes. People would again confuse a familiar voice with a reliable answer, or a beautiful promise with a workable plan. What changed was the number of people able to question a record, describe a risk, and insist on a reason. Mira had entered Namar hoping that good work would speak for itself. She left the meeting knowing that good work needs people who can explain it and institutions willing to hear them.

Your vocabulary can grow in the same ordinary way. The next useful step is small: choose a chapter, close the book, and tell its story in your own words. When a word fails to come, look again. When it comes easily, place it in a different situation. Let the city fade if it must. Keep the language you can now use to describe the world outside it.""",
        "next_reading": {
            "after_chapter": "Close the book. Explain the episode in three sentences using three target words. Choose two difficult words and invent new sentences. Compare them with the glossary, then correct any mistaken meaning.",
            "on_return": "Revisit the chapter the next day, several days later, and the following week. Try the final section before looking at definitions. Give uncertain words another turn in a situation from your own life.",
            "when_words_blur": [
                {"pair": "disinterested vs. uninterested", "tip": "Disinterested = impartial/fair; Uninterested = bored/unconcerned."},
                {"pair": "ingenuous vs. disingenuous", "tip": "Ingenuous = innocent/candid; Disingenuous = falsely calculating/insincere."},
                {"pair": "discrete vs. discreet", "tip": "Discrete = separate/distinct; Discreet = prudent/secretive."},
                {"pair": "enervate vs. energize", "tip": "Enervate = drain of strength/exhaust; completely the opposite of energize!"}
            ]
        }
    }
}

# Write JS files
with open("data/chapters.js", "w", encoding="utf-8") as f:
    f.write("// Complete 27 Laws of The Price of Influence\n")
    f.write("window.BOOK_CHAPTERS = " + json.dumps(all_laws, indent=2, ensure_ascii=False) + ";\n")
    f.write("window.BOOK_METADATA = " + json.dumps(metadata, indent=2, ensure_ascii=False) + ";\n")

with open("data/glossary.js", "w", encoding="utf-8") as f:
    f.write("// Complete Vocabulary Glossary with 333 Entries\n")
    f.write("window.VOCAB_GLOSSARY = " + json.dumps(enriched_glossary, indent=2, ensure_ascii=False) + ";\n")

print(f"Exported data/chapters.js ({len(all_laws)} chapters) and data/glossary.js ({len(enriched_glossary)} entries) successfully!")
