import Icon from '@/components/icon'
import { TouchableOpacity, View, Text } from 'react-native'

export type KeywordItemData = {
  keyword: string
  type: 'recent' | 'popular'
}

type KeywordItemProps = {
  item: KeywordItemData
  onPress: (keyword: string) => void
  onRemove?: () => void
}

export const KeywordItem = ({ item, onPress, onRemove }: KeywordItemProps) => {
  return (
    <View className="flex-row items-center border-b border-white/6 py-5 gap-3">
      <View className="w-7 items-center">
        <Icon
          name={item.type === 'recent' ? 'history' : 'search'}
          size={24}
        />
      </View>
      <TouchableOpacity onPress={() => onPress(item.keyword)} className="flex-1">
        <Text className="text-text text-lg font-medium" numberOfLines={1}>
          {item.keyword}
        </Text>
      </TouchableOpacity>
      {item.type === 'recent' && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          className="p-1"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon name="close" size={18} />
        </TouchableOpacity>
      )}
    </View>
  )
}
