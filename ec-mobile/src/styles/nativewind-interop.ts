import Icon from '@/components/icon'
import { cssInterop } from 'nativewind'

cssInterop(Icon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
    },
  },
})
