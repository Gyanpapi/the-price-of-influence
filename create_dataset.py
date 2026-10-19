# create_dataset.py
import json
import re

# Complete Glossary data
glossary_raw = """
abate - lessen in force or amount. Law 18
aberrant - departing from what is normal or expected. Law 1
abeyance - a temporary state of suspension. Law 13
abscond - leave secretly to escape detection or responsibility. Law 25
abstemious - restrained in eating and drinking. Law 12
admonish - warn or scold gently. Law 10
adulterate - make impure by adding inferior material. Law 25
aesthetic - concerned with beauty or artistic effect. Law 21
aggregate - gather separate items into a whole. Law 16
alacrity - cheerful eagerness to act. Law 26
alleviate - make pain or difficulty less severe. Law 18
amalgamate - combine into a single organization or whole. Law 16
ambiguous - open to more than one interpretation. Law 24
ambivalence - the presence of conflicting feelings. Law 22
ameliorate - improve an unsatisfactory condition. Law 18
anachronism - something out of place in its time. Law 23
analogous - comparable in a relevant respect. Law 7
anarchy - absence or collapse of governing order. Law 16
anomalous - irregular or inconsistent with a pattern. Law 1
antipathy - strong dislike or aversion. Law 9
apathy - lack of interest or concern. Law 15
appease - calm anger or satisfy a demand. Law 10
apprise - inform someone about something. Law 24
approbation - approval or favorable judgment. Law 4
appropriate - take or set aside for one's own use. Law 12
arduous - requiring strenuous effort. Law 15
artless - unaffected and free from deceit. Law 14
ascetic - practicing strict self-denial. Law 12
assiduous - consistently diligent and attentive. Law 15
assuage - ease an unpleasant feeling or need. Law 10
attenuate - reduce the force or strength of something. Law 18
audacious - boldly daring, sometimes overly bold. Law 6
austere - severely plain, restrained, or strict. Law 12
autonomous - self-governing or independently controlled. Law 16
aver - assert confidently as a fact. Law 11
banal - unoriginal and dull through familiarity. Law 21
belie - give a misleading impression of or contradict. Law 3
beneficent - actively doing good for others. Law 14
bolster - support or strengthen. Law 20
bombastic - inflated in language beyond the substance. Law 21
boorish - rude and insensitive. Law 4
burgeon - grow or expand rapidly. Law 19
burnish - polish a surface or improve a reputation. Law 14
buttress - support physically or strengthen an argument. Law 20
capricious - changing unpredictably on a whim. Law 22
castigation - severe criticism or punishment. Law 10
catalyst - something that triggers or speeds change. Law 19
caustic - sharply biting or corrosive. Law 5
chicanery - deception through clever trickery. Law 3
coagulate - thicken or form a clot or mass. Law 17
coda - a concluding section or passage. Law 23
cogent - convincing because of clear, sound reasoning. Law 2
commensurate - proportionate to something else. Law 13
compendium - a concise collection of useful information. Law 2
complaisant - eager to please or accommodate others. Law 4
compliant - willing to obey a rule or request. Law 4
conciliatory - intended to reduce hostility. Law 10
condone - accept or overlook wrongdoing. Law 10
confound - confuse, frustrate, or defeat expectations. Law 27
connoisseur - an expert judge of a particular art or quality. Law 21
contention - a claim being argued; also a dispute. Law 9
contentious - likely to cause argument or quarrelsome. Law 9
contrite - genuinely sorry for wrongdoing. Law 10
conundrum - a puzzling or difficult problem. Law 27
converge - move toward the same point. Law 16
convoluted - complicated and difficult to follow. Law 2
craven - contemptibly cowardly. Law 6
daunt - discourage or intimidate. Law 6
decorum - proper and dignified behavior. Law 4
default - fail to fulfill an obligation. Law 13
deference - respectful yielding to another's judgment. Law 4
delineate - describe or outline clearly. Law 2
denigrate - unfairly attack someone's worth or reputation. Law 14
deride - mock with contempt. Law 14
derivative - largely copied or developed from earlier work. Law 7
desiccate - dry out thoroughly. Law 26
desultory - lacking a steady plan or direction. Law 15
deterrent - something that discourages an action. Law 18
diatribe - a bitter verbal attack. Law 5
dichotomy - a division into two contrasting categories. Law 27
diffidence - shyness or lack of self-confidence. Law 6
diffuse - wordy, spread out, or poorly concentrated. Law 2
digression - a departure from the main subject. Law 2
dirge - a mournful song, especially for the dead. Law 23
disabuse - free someone from a mistaken belief. Law 1
discerning - able to notice and judge fine distinctions. Law 1
discordant - conflicting or out of harmony. Law 27
discredit - damage belief in someone's reliability. Law 11
discrepancy - a mismatch between things expected to agree. Law 1
discrete - separate and individually distinct. Law 16
disingenuous - pretending to be candid or sincere. Law 3
disinterested - impartial and free from personal advantage. Law 11
disjointed - poorly connected or lacking coherence. Law 16
dismiss - reject from consideration or send away. Law 24
disparage - speak of as having little worth. Law 14
disparate - markedly different from one another. Law 16
dissemble - hide one's real feelings or intentions. Law 3
disseminate - spread information widely. Law 24
dissolution - the ending or breaking apart of a body. Law 16
dissonance - a clash or lack of harmony. Law 27
distend - swell or expand outward. Law 17
distill - extract or express the essential part. Law 2
diverge - move or develop in different directions. Law 16
divest - strip someone of property, rights, or authority. Law 13
document - record or support with recorded evidence. Law 1
dogmatic - asserting opinions as unquestionable truth. Law 8
dormant - inactive but capable of becoming active. Law 19
dupe - a person successfully deceived by another. Law 3
ebullient - overflowing with cheerful enthusiasm. Law 22
eclectic - drawing selectively from varied sources. Law 7
efficacy - ability to produce the intended effect. Law 20
effrontery - shameless boldness or impudence. Law 4
elegy - a poem of mourning or lamentation. Law 23
elicit - draw out a response or information. Law 24
embellish - decorate or add details to a description. Law 21
empirical - based on observation or experiment. Law 1
emulate - seek to match a good example. Law 7
endemic - regularly found in a particular place or group. Law 25
enervate - drain of strength or energy. Law 15
engender - cause a feeling or condition to arise. Law 19
enhance - improve or increase a desirable quality. Law 20
ephemeral - lasting only a short time. Law 23
equanimity - mental steadiness under difficulty. Law 5
equivocate - use ambiguity to avoid a clear position. Law 3
erudite - having extensive scholarly learning. Law 7
esoteric - understood mainly by a small specialist group. Law 7
eulogy - a speech or text praising someone, often the dead. Law 23
euphemism - a milder expression for an unpleasant reality. Law 24
exacerbate - make an existing problem worse. Law 18
exculpate - clear from blame. Law 11
exigency - an urgent need or demanding emergency. Law 18
extrapolation - an estimate beyond the available observations. Law 1
facetious - inappropriately humorous about a serious matter. Law 26
facilitate - make an action easier. Law 20
fallacious - based on faulty or deceptive reasoning. Law 3
fatuous - foolish, often in a smug way. Law 21
fawning - excessively flattering to gain favor. Law 4
felicitous - particularly apt or well suited. Law 26
fervor - intense enthusiasm or feeling. Law 8
flag - weaken or tire; also mark for attention. Law 24
fledgling - new and inexperienced. Law 7
flout - openly disregard a rule. Law 25
foment - stir up trouble or unrest. Law 9
forestall - prevent or hinder by acting in advance. Law 18
frugality - careful avoidance of unnecessary expense. Law 12
futile - incapable of achieving the desired result. Law 27
gainsay - deny or contradict. Law 24
garrulous - excessively talkative, often rambling. Law 22
goad - provoke or urge into action. Law 9
gouge - overcharge unfairly. Law 12
grandiloquent - lofty or pompous in expression. Law 21
gregarious - enjoying company and social contact. Law 22
guileless - free from deceit or cunning. Law 14
gullible - too ready to believe and be deceived. Law 3
harangue - a long, forceful, scolding speech. Law 5
homogeneous - uniform in kind or composition. Law 16
hyperbole - deliberate or extravagant exaggeration. Law 21
iconoclastic - challenging established beliefs or institutions. Law 8
idolatry - worship or excessive admiration. Law 8
immutable - unchangeable. Law 8
impair - damage or reduce effectiveness. Law 20
impassive - showing no visible emotion. Law 5
impede - hinder movement or progress. Law 20
impermeable - not allowing a substance to pass through. Law 17
imperturbable - not easily upset or disturbed. Law 5
impervious - resistant to passage, damage, or influence. Law 17
implacable - not easily calmed or reconciled. Law 9
implicit - suggested or understood without direct statement. Law 24
implode - collapse inward. Law 27
inadvertently - unintentionally or through oversight. Law 25
inchoate - only beginning and not fully formed. Law 19
incongruity - a mismatch or lack of suitability. Law 21
inconsequential - of little importance or consequence. Law 25
incorporate - include as part of a larger whole. Law 7
indeterminate - not yet fixed, known, or precisely decided. Law 1
indigence - severe poverty. Law 12
indolent - habitually lazy or avoiding effort. Law 15
inert - inactive or lacking power to move. Law 16
ingenuous - candid, innocent, or naively frank. Law 14
inherent - belonging to the essential nature of something. Law 25
innocuous - harmless or unlikely to offend. Law 25
insensible - unaware, unconscious, or lacking sensitivity. Law 26
insinuate - suggest indirectly, often negatively. Law 24
insipid - lacking flavor, interest, or vigor. Law 21
insularity - narrowness from isolation or limited outlook. Law 8
intractable - difficult to manage or solve. Law 9
intransigence - stubborn refusal to compromise. Law 8
intrepid - resolutely courageous. Law 6
inundate - flood or overwhelm. Law 17
inured - hardened or accustomed through exposure. Law 26
invective - insulting and abusive language. Law 5
irascible - easily angered. Law 5
irresolute - unable to decide firmly. Law 6
itinerary - a plan of a journey or sequence of visits. Law 26
laconic - using very few words. Law 2
lassitude - physical or mental weariness. Law 15
latent - present but not yet expressed. Law 19
laud - praise highly. Law 4
lethargic - sluggish and lacking energy. Law 15
levee - an embankment that holds back water. Law 17
levity - lightness that may be unsuitable for seriousness. Law 26
log - a continuing record of events. Law 1
loquacious - very talkative. Law 22
lucid - clear and easy to understand. Law 2
luminous - giving off or reflecting light. Law 26
magnanimity - generosity beyond pettiness or revenge. Law 10
malingerer - someone who feigns illness to avoid duty. Law 15
malleable - able to be shaped or influenced. Law 19
maverick - an independent person departing from convention. Law 27
mendacious - deliberately untruthful. Law 3
metamorphosis - a substantial transformation. Law 19
meticulous - extremely careful about details. Law 1
misanthrope - a person who dislikes humanity. Law 22
mitigate - make harm or severity less great. Law 18
mollify - soften anger or resentment. Law 10
morose - gloomy or ill-tempered. Law 22
mundane - ordinary, everyday, or worldly. Law 26
negate - cancel out or make ineffective. Law 20
neophyte - a beginner or new member. Law 7
obdurate - stubborn despite persuasion. Law 9
obsequious - excessively submissive to gain favor. Law 4
obviate - remove the need for something. Law 18
occlude - block or close an opening. Law 17
officious - intrusively helpful or meddlesome. Law 25
onerous - burdensome in duty or effort. Law 13
opprobrium - strong public condemnation or disgrace. Law 14
oscillate - move back and forth between positions. Law 6
ostentatious - showily displaying wealth or importance. Law 12
paragon - a model of excellence. Law 14
partisan - strongly committed to one side. Law 8
pathological - related to disease; also abnormally extreme. Law 25
paucity - scarcity or insufficient quantity. Law 12
pedantic - excessively concerned with minor learned details. Law 7
penchant - a strong liking or inclination. Law 25
penury - extreme poverty. Law 12
perennial - lasting long or returning repeatedly. Law 23
perfidious - treacherous and faithless. Law 14
perfunctory - done routinely with little care or interest. Law 15
permeable - allowing a substance to pass through. Law 17
pervasive - spread throughout something. Law 25
phlegmatic - naturally calm and not easily excited. Law 5
piety - religious devotion or dutiful reverence. Law 8
placate - calm someone's anger. Law 10
plasticity - capacity to be reshaped or adapted. Law 19
platitude - a dull, familiar remark presented as wisdom. Law 21
plethora - an excessive abundance. Law 12
plummet - fall very rapidly. Law 27
porous - containing pores or small openings. Law 17
pragmatic - concerned with practical results. Law 20
preamble - an introduction before the main statement. Law 24
precarious - unstable, uncertain, or insecure. Law 6
precipitate - rash or unduly hasty. Law 18
precursor - something that comes before and signals another. Law 19
presumptuous - overstepping what one is entitled to assume. Law 4
prevaricate - evade the truth with misleading statements. Law 3
pristine - untouched, unspoiled, or perfectly fresh. Law 23
probity - moral honesty and integrity. Law 11
problematic - involving difficulties or doubtful assumptions. Law 20
prodigal - wastefully extravagant. Law 12
profound - very deep in meaning, feeling, or understanding. Law 23
prohibitive - so costly or restrictive as to prevent action. Law 13
proliferate - increase or multiply rapidly. Law 19
propensity - a natural tendency toward something. Law 25
propitiate - try to gain favor or avert anger. Law 10
propriety - fitness and correctness of conduct. Law 4
proscribe - formally forbid. Law 13
pungent - sharply strong in smell, taste, or expression. Law 26
qualified - limited or conditional rather than absolute. Law 13
quibble - argue over a minor point; a petty objection. Law 24
quiescent - quiet and temporarily inactive. Law 19
rarefied - thin in air; also remote from ordinary concerns. Law 21
recalcitrant - resisting authority or control. Law 9
recant - withdraw a previously stated belief or claim. Law 11
recluse - someone living largely apart from society. Law 22
recondite - obscure and difficult to understand. Law 7
refractory - stubbornly resistant to control or treatment. Law 9
refute - disprove with evidence or reasoning. Law 11
relegate - assign to a lower or less important position. Law 13
reproach - express disapproval or disappointment. Law 10
reprobate - a morally corrupt or unprincipled person. Law 14
repudiate - reject, disown, or refuse to accept. Law 11
rescind - formally cancel. Law 13
resolution - firm determination to carry out a purpose. Law 6
resolve - firmness of purpose or determination. Law 6
reticent - inclined to silence or reserve. Law 6
reverent - deeply respectful. Law 8
sage - a person of profound wisdom. Law 7
salubrious - promoting health or well-being. Law 26
sanction - officially approve; also a penalty or penalizing act. Law 11
satiate - satisfy fully. Law 26
saturate - soak or fill to capacity. Law 17
savor - enjoy attentively, especially a flavor. Law 26
secrete - hide away; also produce and release a substance. Law 23
shard - a broken fragment, especially of pottery or glass. Law 23
skeptic - someone withholding belief until evidence is examined. Law 24
solicitous - showing attentive concern. Law 22
soporific - causing sleepiness. Law 15
specious - apparently convincing but actually misleading. Law 3
sporadic - occurring at irregular intervals. Law 15
stigma - a mark of social disgrace. Law 14
stint - limit or provide sparingly. Law 12
stipulate - specify as a required condition. Law 13
stolid - unemotional, impassive, or dull in response. Law 5
striated - marked with parallel bands or grooves. Law 17
strut - a proud, pompous walk; also a supporting bar. Law 27
subpoena - a formal order to appear as a witness. Law 11
subside - settle down, decrease, or become quiet. Law 18
substantiate - support with sufficient evidence. Law 11
supersede - replace something earlier. Law 20
supposition - an assumption or tentative explanation. Law 1
tacit - understood without being explicitly stated. Law 24
tangential - only slightly connected to the main subject. Law 2
tenuous - weak, thin, or poorly supported. Law 27
tirade - a prolonged angry speech. Law 5
torpor - sluggishness or a state of low activity. Law 15
tortuous - twisting, indirect, or complicated. Law 2
tractable - easily managed or dealt with. Law 9
transgression - a violation of a rule, law, or moral boundary. Law 11
truculence - aggressive hostility. Law 9
vacillate - waver between choices. Law 6
venerate - regard with great respect. Law 8
veracious - truthful or accurate. Law 3
verbose - using more words than needed. Law 2
viable - capable of working or continuing successfully. Law 20
viscous - thick and resistant to flowing. Law 17
vituperative - harshly abusive in language. Law 5
volatile - liable to change suddenly; also readily evaporating. Law 22
warranted - justified or properly authorized. Law 13
wary - careful because of possible danger. Law 27
welter - a confused mass or disorderly jumble. Law 27
whimsical - fanciful or unpredictably playful. Law 22
zealot - an excessively fervent or uncompromising supporter. Law 8
"""

glossary_list = []
lines = [l.strip() for l in glossary_raw.strip().split("\n") if l.strip()]
for l in lines:
    parts = l.split(" - ")
    word = parts[0].strip()
    rest = parts[1].strip()
    law_idx = rest.rfind("Law ")
    if law_idx != -1:
        definition = rest[:law_idx].strip().rstrip(".")
        law_num = int(rest[law_idx+4:].strip())
    else:
        definition = rest
        law_num = 1
    glossary_list.append({
        "word": word,
        "definition": definition,
        "law": law_num
    })

# Add special distinction for dual meaning words:
# 'strut' appears twice in source list (walk, and support bar)
# 'secrete' appears with hide and produce/release
# 'sanction' appears with approval and penalty
# 'flag' appears with mark and weaken

print(f"Glossary count: {len(glossary_list)}")

# Group words by law
words_by_law = {}
for item in glossary_list:
    law = item["law"]
    if law not in words_by_law:
        words_by_law[law] = []
    if item["word"] not in words_by_law[law]:
        words_by_law[law].append(item["word"])

for k in sorted(words_by_law.keys()):
    print(f"Law {k}: {len(words_by_law[k])} words -> {', '.join(words_by_law[k])}")
