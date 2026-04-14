import { AntDesign } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'

export default function Icon(props: React.ComponentProps<typeof AntDesign>) {
  const scheme = useColorScheme()
  const color = props.color || (scheme === 'dark' ? 'white' : 'black')
  return <AntDesign {...props} color={color} />
}
