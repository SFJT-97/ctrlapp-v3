import { Text } from 'react-native-paper'
// import { gql, useLazyQuery } from '@apollo/client'
import { ScrollView, View } from 'react-native'

// Considerar que answer y query son arreglos
// const AnswerGPT4Q = gql`
// query Query($query: [String!]!, $companyName: String, $eMarayName: String, $answer: [String]) {
//   AnswerGPT4(query: $query, companyName: $companyName, eMarayName: $eMarayName, answer: $answer)
// }

// `

const Conversation = ({ option }) => {
  // const [AnswerGPT4] = useLazyQuery(AnswerGPT4Q, { fetchPolicy: 'network-only' })

  return (
    <View style={{ position: 'relative', flex: 1, flexDirection: 'column' }}>
      <ScrollView>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates reiciendis impedit delectus ea. Odit quaerat quos error laboriosam ut facere corrupti quia hic est saepe accusamus aliquid sed, magnam quasi?
          Quos, consequatur quam debitis ea minus vero molestias possimus. Repudiandae, reiciendis dolorem itaque provident libero, sunt optio qui dolore maxime cupiditate consequatur, unde totam impedit voluptatibus! Ut aperiam tenetur ea!
          Quod laudantium doloribus, incidunt saepe eveniet qui distinctio praesentium blanditiis maiores reiciendis nostrum facilis possimus tenetur consequatur quo temporibus voluptatem expedita, ducimus dignissimos. Earum, veniam. Nihil, ipsa temporibus! Aliquam, distinctio.
          Obcaecati, quibusdam amet? Amet corrupti, delectus neque quisquam rerum nulla ipsa et, nesciunt dolor nihil nemo. Tempore vel magnam illum corporis commodi asperiores laudantium ea eius ex. Perferendis, doloremque distinctio.
          Animi quos placeat cum sunt consectetur libero eaque quae? Ullam ex dicta, a sapiente aliquid itaque laudantium sed vitae nostrum recusandae quibusdam! Consequatur adipisci illo voluptate repellat aspernatur qui amet.
          Nobis amet tempore tempora maxime necessitatibus, possimus velit nam dolores consequuntur repudiandae nulla ipsum reiciendis laborum ullam placeat. A magni distinctio fuga est. Officiis vero asperiores voluptatibus at commodi cumque?
          Tempora ullam magnam ex vel itaque deleniti ab id rerum ad? Fugiat perspiciatis aspernatur fugit rem quia voluptatum dignissimos tenetur autem dolor doloribus nihil architecto fuga, praesentium sit modi repudiandae.
          Itaque cum veniam perferendis perspiciatis suscipit cumque fugit numquam similique odio autem et saepe, deserunt ullam debitis veritatis, velit placeat quaerat ipsa eum, esse quia. Consectetur impedit mollitia dolor maxime.
          Deleniti sit laudantium sequi enim, molestias obcaecati nihil dolore! Atque vitae officia nisi maiores voluptatem minima voluptatibus reiciendis, facere nostrum earum voluptatum accusantium enim consequuntur est vel fuga iure sed.
          Ipsam delectus, eveniet excepturi saepe perferendis temporibus itaque quidem minima quam. Beatae numquam nesciunt culpa, tempora ratione voluptatum itaque odio, voluptate, voluptatem magnam repellat cum dolorem blanditiis harum optio maiores?
        </Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates reiciendis impedit delectus ea. Odit quaerat quos error laboriosam ut facere corrupti quia hic est saepe accusamus aliquid sed, magnam quasi?
          Quos, consequatur quam debitis ea minus vero molestias possimus. Repudiandae, reiciendis dolorem itaque provident libero, sunt optio qui dolore maxime cupiditate consequatur, unde totam impedit voluptatibus! Ut aperiam tenetur ea!
          Quod laudantium doloribus, incidunt saepe eveniet qui distinctio praesentium blanditiis maiores reiciendis nostrum facilis possimus tenetur consequatur quo temporibus voluptatem expedita, ducimus dignissimos. Earum, veniam. Nihil, ipsa temporibus! Aliquam, distinctio.
          Obcaecati, quibusdam amet? Amet corrupti, delectus neque quisquam rerum nulla ipsa et, nesciunt dolor nihil nemo. Tempore vel magnam illum corporis commodi asperiores laudantium ea eius ex. Perferendis, doloremque distinctio.
          Animi quos placeat cum sunt consectetur libero eaque quae? Ullam ex dicta, a sapiente aliquid itaque laudantium sed vitae nostrum recusandae quibusdam! Consequatur adipisci illo voluptate repellat aspernatur qui amet.
          Nobis amet tempore tempora maxime necessitatibus, possimus velit nam dolores consequuntur repudiandae nulla ipsum reiciendis laborum ullam placeat. A magni distinctio fuga est. Officiis vero asperiores voluptatibus at commodi cumque?
          Tempora ullam magnam ex vel itaque deleniti ab id rerum ad? Fugiat perspiciatis aspernatur fugit rem quia voluptatum dignissimos tenetur autem dolor doloribus nihil architecto fuga, praesentium sit modi repudiandae.
          Itaque cum veniam perferendis perspiciatis suscipit cumque fugit numquam similique odio autem et saepe, deserunt ullam debitis veritatis, velit placeat quaerat ipsa eum, esse quia. Consectetur impedit mollitia dolor maxime.
          Deleniti sit laudantium sequi enim, molestias obcaecati nihil dolore! Atque vitae officia nisi maiores voluptatem minima voluptatibus reiciendis, facere nostrum earum voluptatum accusantium enim consequuntur est vel fuga iure sed.
          Ipsam delectus, eveniet excepturi saepe perferendis temporibus itaque quidem minima quam. Beatae numquam nesciunt culpa, tempora ratione voluptatum itaque odio, voluptate, voluptatem magnam repellat cum dolorem blanditiis harum optio maiores?
        </Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates reiciendis impedit delectus ea. Odit quaerat quos error laboriosam ut facere corrupti quia hic est saepe accusamus aliquid sed, magnam quasi?
          Quos, consequatur quam debitis ea minus vero molestias possimus. Repudiandae, reiciendis dolorem itaque provident libero, sunt optio qui dolore maxime cupiditate consequatur, unde totam impedit voluptatibus! Ut aperiam tenetur ea!
          Quod laudantium doloribus, incidunt saepe eveniet qui distinctio praesentium blanditiis maiores reiciendis nostrum facilis possimus tenetur consequatur quo temporibus voluptatem expedita, ducimus dignissimos. Earum, veniam. Nihil, ipsa temporibus! Aliquam, distinctio.
          Obcaecati, quibusdam amet? Amet corrupti, delectus neque quisquam rerum nulla ipsa et, nesciunt dolor nihil nemo. Tempore vel magnam illum corporis commodi asperiores laudantium ea eius ex. Perferendis, doloremque distinctio.
          Animi quos placeat cum sunt consectetur libero eaque quae? Ullam ex dicta, a sapiente aliquid itaque laudantium sed vitae nostrum recusandae quibusdam! Consequatur adipisci illo voluptate repellat aspernatur qui amet.
          Nobis amet tempore tempora maxime necessitatibus, possimus velit nam dolores consequuntur repudiandae nulla ipsum reiciendis laborum ullam placeat. A magni distinctio fuga est. Officiis vero asperiores voluptatibus at commodi cumque?
          Tempora ullam magnam ex vel itaque deleniti ab id rerum ad? Fugiat perspiciatis aspernatur fugit rem quia voluptatum dignissimos tenetur autem dolor doloribus nihil architecto fuga, praesentium sit modi repudiandae.
          Itaque cum veniam perferendis perspiciatis suscipit cumque fugit numquam similique odio autem et saepe, deserunt ullam debitis veritatis, velit placeat quaerat ipsa eum, esse quia. Consectetur impedit mollitia dolor maxime.
          Deleniti sit laudantium sequi enim, molestias obcaecati nihil dolore! Atque vitae officia nisi maiores voluptatem minima voluptatibus reiciendis, facere nostrum earum voluptatum accusantium enim consequuntur est vel fuga iure sed.
          Ipsam delectus, eveniet excepturi saepe perferendis temporibus itaque quidem minima quam. Beatae numquam nesciunt culpa, tempora ratione voluptatum itaque odio, voluptate, voluptatem magnam repellat cum dolorem blanditiis harum optio maiores?
        </Text>
        <View style={{ width: '100%', height: '150px', backgroundColor: 'red' }}>
          <Text>lala</Text>
        </View>
      </ScrollView>
    </View>

  )
}

export default Conversation
