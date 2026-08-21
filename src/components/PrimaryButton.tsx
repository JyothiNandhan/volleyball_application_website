import { ComponentProps } from 'react';
import { Button } from 'react-native-paper';

type Props = ComponentProps<typeof Button>;

export function PrimaryButton(props: Props) {
  return <Button mode="contained" contentStyle={{ minHeight: 48 }} {...props} />;
}
