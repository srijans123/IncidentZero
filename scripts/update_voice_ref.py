import sqlite3

conn = sqlite3.connect(r'D:\Apps\Voice Studio\VoiceStudio\data\omnivoice.db')
c = conn.cursor()
ref_text = (
    "Hey there, my name is Srijan and this is a voice sample I am recording to train an AI voice model. "
    "I will try to speak as natural as possible like I am just having a conversation with you, nothing too formal "
    "or rehearsed, so let's start simple."
)
c.execute("UPDATE voice_profiles SET ref_text=? WHERE id='44f29b45'", (ref_text,))
conn.commit()
c.execute("SELECT id, name, LENGTH(ref_text), ref_text FROM voice_profiles WHERE id='44f29b45'")
print("Updated voice profile:", c.fetchall())
conn.close()
