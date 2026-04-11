import pandas as pd

def parse_friendships(friendships):
    bidirectional = pd.concat([
        friendships.rename(columns={'user_id_1': 'user', 'user_id_2': 'friend'}),
        friendships.rename(columns={'user_id_2': 'user', 'user_id_1': 'friend'})
    ])

    friendship_dict = bidirectional.groupby('user')['friend'].apply(set).to_dict()
    return friendship_dict