import * as ImagePicker from 'expo-image-picker';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Menu, Switch, Text, TextInput } from 'react-native-paper';

import { PLAYER_POSITIONS, positionLabel } from '@/constants/positions';
import { Player } from '@/types/domain';
import { PlayerInput, playerInputSchema } from '@/validation/player';
import { RatingStars } from './RatingStars';

export type PlayerFormHandle = {
  submit: () => void;
};

export const PlayerForm = forwardRef<
  PlayerFormHandle,
  {
    initial?: Player;
    saving?: boolean;
    onSubmit: (input: PlayerInput) => Promise<void> | void;
  }
>(function PlayerForm({ initial, onSubmit }, ref) {
  const [name, setName] = useState(initial?.name ?? '');
  const [position, setPosition] = useState<Player['position']>(initial?.position ?? 'flexible');
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [isPlaying, setIsPlaying] = useState(initial?.isPlaying ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photoUrl ?? null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const parsed = playerInputSchema.safeParse({ name, position, rating, isPlaying, notes, photoUrl });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form and try again.');
      return;
    }
    setError(null);
    await onSubmit(parsed.data);
  };

  useImperativeHandle(ref, () => ({ submit }));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!result.canceled) setPhotoUrl(result.assets[0]?.uri ?? null);
  };

  return (
    <View style={styles.form}>
      <TextInput label="Player name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Button mode="outlined" onPress={() => setMenuVisible(true)}>{positionLabel(position)}</Button>}
      >
        {PLAYER_POSITIONS.map((item) => (
          <Menu.Item
            key={item.value}
            title={item.label}
            onPress={() => {
              setPosition(item.value);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
      <View style={styles.row}>
        <Text variant="titleSmall">Skill rating</Text>
        <RatingStars rating={rating} onChange={setRating} size={26} />
      </View>
      <View style={styles.row}>
        <Text variant="titleSmall">Playing today</Text>
        <Switch value={isPlaying} onValueChange={setIsPlaying} />
      </View>
      <TextInput label="Notes" value={notes ?? ''} onChangeText={setNotes} multiline numberOfLines={4} />
      <Button icon="image" mode="outlined" onPress={pickPhoto}>
        {photoUrl ? 'Change profile photo' : 'Choose profile photo'}
      </Button>
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  form: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }
});
