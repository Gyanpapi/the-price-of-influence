# build_chapters_data.py
import json

chapters = []

# Intro and general content
intro_data = {
    "before_you_enter": {
        "title": "Before you enter Namar",
        "text": """Mira arrives in the river city of Namar with a clerk's appointment, a borrowed coat, and a belief that careful work will speak for itself. The city soon teaches her that facts need witnesses, generosity needs boundaries, and authority can punish the person who tells it the truth. Her mentor, the retired record keeper Soren, offers no promise of safety. He offers a more useful question: What will this decision make possible tomorrow?

This book follows Mira through disputed accounts, a failing river wall, a public inquiry, and the temptation to become indispensable. Each chapter presents an original law of judgment, a connected episode, its consequences, a change of approach, a different setting, and a practical test. Power here includes the ordinary ability to influence a meeting, refuse an unfair demand, or protect a person whose voice carries little weight.

Namar and all its people are fictional. The episodes are invented teaching stories, not historical reports. The laws are observations to question, not promises that every situation will obey them. This is an original book, not an adaptation of The 48 Laws of Power.

The vocabulary comes from your Gradify PDF. It contains 333 entries and 332 distinct spellings because strut appears twice: once for a proud walk and once for a supporting bar. Both meanings appear at least five times here. Every other headword also appears at least five times in the chapter prose, apart from headings and the glossary. The uses keep the exact headword spelling so you can recognize and search for it. Some first encounters explain a meaning directly; others let the surrounding action explain it. The glossary at the end gives short, newly written meanings and the chapter in which each word receives its main practice."""
    },
    "how_to_make_stay": {
        "title": "How to make the words stay",
        "text": """Read one chapter at a sitting. On your first pass, follow the people and their choices. Bold words are vocabulary targets; ordinary words around them are clues. When a word returns, pause long enough to recall what it meant before reading on. You do not have to memorize the whole chapter.

After reading, close the book and retell the episode in three sentences using three target words. Then choose two words you still confuse and write a new example from your own life. Check the glossary only after trying to remember. A mistaken guess followed by a correction is more useful than copying a definition without thinking.

Return to the chapter the next day, several days later, and the following week. Read its final section first and see how many meanings you can recover. If the chapter feels dense, divide it across two sittings. Repetition in a book creates opportunities to learn; your attempts to recall and use the words turn those opportunities into a habit."""
    },
    "characters": [
        {"name": "Mira", "role": "Junior clerk who gradually receives responsibility for public works"},
        {"name": "Soren", "role": "Mira's mentor, has spent years keeping the city's records"},
        {"name": "Governor Vale", "role": "Values order and his own reputation"},
        {"name": "Daren", "role": "Senior official who knows how to make a failure sound like somebody else's fault"},
        {"name": "Leela", "role": "Engineer whose observations often disturb comfortable assumptions"},
        {"name": "Ishan", "role": "Runs a grain warehouse"},
        {"name": "Nadi", "role": "Represents the workers of the eastern ward"}
    ]
}

print("Intro data ready.")
