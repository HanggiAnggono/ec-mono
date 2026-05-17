import { ProductDto } from '@/shared/types/api'
import { Link } from '@react-navigation/native'
import { ImageBackground, Text, View } from 'react-native'

type SearchProductCardProps = {
  product: ProductDto
}

const imageUri = (seed: string, w = 200, h = 200) =>
  `https://loremflickr.com/${w}/${h}/${seed.split(' ').shift()}`

export const SearchProductCard = ({ product }: SearchProductCardProps) => (
  <Link
    screen="ProductDetail"
    params={{ id: product.id }}
    className="w-1/2"
  >
    <View className="w-full">
      <View className="overflow-hidden rounded-2xl border border-white/8 bg-[#101933]">
        <View className="rounded-2xl overflow-hidden">
          <ImageBackground
            source={{ uri: imageUri(product.name + '-search', 200, 160) }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
        </View>
        <View className="p-3">
          <Text className="text-text font-semibold text-sm" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-textSecondary text-xs mt-0.5" numberOfLines={1}>
            {product.category?.name}
          </Text>
        </View>
      </View>
    </View>
  </Link>
)
