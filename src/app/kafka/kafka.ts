import { Kafka, logLevel } from 'kafkajs';
import config from '../../config';
import { logger } from '../share/logger';
import { ENUM_KAFKA_TOPIC } from './consent.kafka';
import { consumerKafka } from './consumer.kafka';

export const kafkaClient = new Kafka({
  clientId: config.kafka.clientId as string, //any string example your project name: sampod
  /**
   @enum {String} when you work local, then your local ip(192.168.10.152) and kafka running port (9092)  
   @enum {String} when you work production, then your vps ip(157.223.184.53) and kafka running port (9092)
   */
  brokers: [config.kafka.url as string], //192.168.10.152:9092
  logLevel: logLevel.ERROR, //jest save error log
});

export async function kafkaInit() {
  try {
    const admin = kafkaClient.admin();
    await admin.connect();
    // Fetch the list of existing topics
    const existingTopics = await admin.listTopics();
    // console.log('🚀 ~ kafkaInit ~ existingTopics:', existingTopics);

    //! ******** Fetch and log details for each topic*****
    /*  
     const metadata = await admin.fetchTopicMetadata({
      topics: existingTopics,
       });
     console.log('🚀 ~ kafkaInit ~ metadata:', metadata.topics[0]);
    */
    //! ******** delete topics ******
    /* 
    const deleteRes = await admin.deleteTopics({
      topics: [ENUM_KAFKA_TOPIC.message],
    });
    console.log('🚀 ~ kafkaInit ~ deleteRes:', deleteRes);
     */

    const currentPartitions = 3;
    // Check if the specific topic exists
    /**
    @enum {String} ENUM_KAFKA_TOPIC.message="message" -> any string/your message broker name
 
   */
    const allTopics = Object.values(ENUM_KAFKA_TOPIC);
    // console.log('🚀 ~ kafkaInit ~ allTopics:', allTopics);
    for (const topic of allTopics) {
      if (!existingTopics.includes(topic)) {
        //
        // Topic does not exist, so create it
        const res = await admin.createTopics({
          // waitForLeaders: true,
          // validateOnly: true,
          // timeout: 5000,
          topics: [
            {
              topic: topic,
              numPartitions: currentPartitions, // Starting with 1 partition
              // numPartitions: 4, // Uncomment this line if you want more partitions
            },
          ],
        });
        console.log('🚀 ~ kafkaInit ~ res:', res);
      } else {
        console.log(`Topic "${topic}" already exists.`);
        // Increase the number of partitions
        /* 
        const newPartitionCount = 3; // Specify the new number of partitions
        const currentPartitions =
          metadata.topics.find(topic => topic.name === topic)
            ?.partitions.length || 0;
  
        if (currentPartitions < newPartitionCount) {
          console.log(
            `Increasing partitions for topic "${topic}" from ${currentPartitions} to ${newPartitionCount}`,
          );
  
          const res = await admin.createPartitions({
            topicPartitions: [
              {
                topic: topic,
                count: newPartitionCount,
              },
            ],
          });
          console.log('🚀 ~ kafkaInit ~ Partition increase result:', res);
        } else {
          console.log(
            `Topic "${topic}" already has ${currentPartitions} partitions.`,
          );
        }
     */
      }
    }

    await admin.disconnect();
    await consumerKafka(); // accepted all message/request
  } catch (error) {
    if (config.env === 'production') {
      logger.error(error);
    } else {
      console.log('🚀 ~ kafkaInit ~ error:', error);
    }
  }
}
