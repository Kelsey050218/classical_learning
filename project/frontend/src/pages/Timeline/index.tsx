import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, message, Modal } from 'antd'
import {
  BookOutlined,
  SoundOutlined,
  FileTextOutlined,
  TeamOutlined,
  StarOutlined,
  ReadOutlined,
  FireOutlined,
  RiseOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Button from '../../components/UI/Button'
import EvaluationForm from '../../components/EvaluationForm'
import { listTimelineNodes, type TimelineNode } from '../../api/timelineNodes'
import { completeSubProject } from '../../api/learning'
import { TIMELINE_ERAS } from '../../data/timelineEras'
import useTimelineMarks from '../../hooks/useTimelineMarks'
import EraDetailPanel from '../../components/Timeline/EraDetailPanel'

const { Title, Text } = Typography

const eraIcons: Record<string, React.ReactNode> = {
  '先秦': <SoundOutlined />,
  '汉代': <FileTextOutlined />,
  '魏晋南北朝': <TeamOutlined />,
  '唐代': <StarOutlined />,
  '宋代': <ReadOutlined />,
  '元代': <FireOutlined />,
  '明清': <RiseOutlined />,
}

const eraGradients: Record<string, string> = {
  '先秦': 'from-[#8B6914]/20 to-[#D4A843]/10',
  '汉代': 'from-[#8B4513]/20 to-[#CD853F]/10',
  '魏晋南北朝': 'from-[#556B2F]/20 to-[#8FBC8F]/10',
  '唐代': 'from-[#8B0000]/20 to-[#CD5C5C]/10',
  '宋代': 'from-[#2F4F4F]/20 to-[#5F9EA0]/10',
  '元代': 'from-[#483D8B]/20 to-[#9370DB]/10',
  '明清': 'from-[#800080]/20 to-[#DA70D6]/10',
}

const eraBorderColors: Record<string, string> = {
  '先秦': 'border-[#8B6914]/30',
  '汉代': 'border-[#8B4513]/30',
  '魏晋南北朝': 'border-[#556B2F]/30',
  '唐代': 'border-[#8B0000]/30',
  '宋代': 'border-[#2F4F4F]/30',
  '元代': 'border-[#483D8B]/30',
  '明清': 'border-[#800080]/30',
}

const keyPointDetails: Record<string, string> = {
  '《诗经》：最早的诗歌总集，现实主义源头，风雅颂/赋比兴': `《诗经》是中国最早的诗歌总集，收录了西周初年至春秋中叶（前11世纪至前6世纪）的诗歌305篇，因此又称"诗三百"。

【风雅颂】
• 风：各诸侯国的民间歌谣，共15国风160篇，多为民歌，是《诗经》的精华。
• 雅：周王朝京都地区的乐歌，分大雅、小雅，共105篇，多为贵族文人作品。
• 颂：宗庙祭祀的乐歌，共40篇，内容多为歌颂祖先功业。

【赋比兴】
• 赋：直陈其事，直接铺叙描写。
• 比：比喻，以彼物比此物。
• 兴：先言他物以引起所咏之词，托物起兴。

《诗经》开创了中国现实主义文学传统，"饥者歌其食，劳者歌其事"，真实反映了先秦社会生活的方方面面。`,
  '《楚辞》：浪漫主义源头，屈原《离骚》开创骚体': `《楚辞》是战国时期以屈原为代表的楚国人创作的诗歌总集，是中国浪漫主义文学的源头。

【屈原与《离骚》】
屈原（约前340—前278年），楚国贵族，因遭谗言被流放，心怀忧愤而作《离骚》。"离骚"意为"离忧"，是屈原的代表作，也是中国最长的抒情诗。

【骚体特征】
• 句式灵活，多用"兮"字调节节奏
• 想象丰富，感情奔放
• 大量运用神话传说和香草美人的比喻
• 突破了《诗经》四言为主的句式，以六、七言为主

《楚辞》对后世文学影响深远，与《诗经》并称"风骚"，成为中国古典诗歌的两大源头。`,
  '汉乐府：感于哀乐、缘事而发，《孔雀东南飞》': `汉乐府是汉代官方音乐机构"乐府"采集、整理和创作的诗歌。

【"感于哀乐，缘事而发"】
这是汉乐府的核心创作精神，意为诗歌是因现实的哀乐之情和具体事件而发，强调写实性和社会性。

【《孔雀东南飞》】
• 汉乐府民歌中最长的叙事诗
• 讲述焦仲卿与刘兰芝的爱情悲剧
• 与北朝《木兰诗》并称"乐府双璧"

【乐府诗特点】
• 叙事性强，善于刻画人物
• 语言朴素自然，口语化
• 形式自由，以五言为主
• 题材广泛，反映社会现实和民间疾苦`,
  '古诗十九首：五言冠冕，文人诗开端': `《古诗十九首》是东汉末年一组无名氏五言诗，代表了汉代文人五言诗的最高成就。

【地位】
• 被称为"五言之冠冕"（刘勰《文心雕龙》）
• 标志着文人五言诗的成熟
• 被视为古诗由民间转入文人创作的转折点

【主题内容】
• 游子思妇的离愁别绪
• 人生无常的慨叹
• 宦途失意的苦闷
• 及时行乐的思想

【艺术特色】
• 语言朴素自然，不假雕琢
• 抒情性强，情景交融
• 善用比兴，含蓄蕴藉`,
  '建安风骨：曹操、曹植，慷慨悲凉': `建安风骨是东汉末年建安时期（196—220年）形成的文学风格。

【代表人物】
• "三曹"：曹操、曹丕、曹植
• "建安七子"：孔融、陈琳、王粲、徐干、阮瑀、应玚、刘桢

【风格特征】
• 慷慨悲凉：直面乱世的苦难，抒发建功立业的豪情
• 梗概多气：作品内容充实，感情强烈
• 语言质朴：反对华丽辞藻，追求刚健有力

【代表作品】
曹操《短歌行》《龟虽寿》、曹植《白马篇》、王粲《七哀诗》等。

建安风骨成为中国文学批评的重要范畴，后世常以"建安风骨"作为健康向上、刚健有力的文学风格的标杆。`,
  '陶渊明：田园诗鼻祖，平淡自然': `陶渊明（约365—427年），名潜，字元亮，东晋末至南朝宋初诗人，是中国田园诗派的开创者。

【人生经历】
曾任江州祭酒、彭泽县令等职，因"不为五斗米折腰"辞官归隐，过着躬耕自资的田园生活。

【代表作】
• 诗：《饮酒》《归园田居》《读山海经》
• 文：《归去来兮辞》《桃花源记》《五柳先生传》

【艺术风格】
• 平淡自然：语言质朴无华，却意蕴深远
• 情景交融：田园景物与隐逸情怀完美结合
• 真淳淡泊：表现了安贫乐道、返璞归真的人生境界

苏轼评价其诗"质而实绮，癯而实腴"，平淡中见功力。`,
  '永明体：讲究声律平仄，为唐诗奠基': `永明体是南朝齐武帝永明年间（483—493年）兴起的一种新诗体，又称"新体诗"。

【声律说】
• 周颙发现汉语四声（平、上、去、入）
• 沈约提出"四声八病"说，规范诗歌声律
• 要求诗句中平仄交替，避免声律上的"八病"

【代表诗人】
• "竟陵八友"：萧衍、沈约、谢朓、王融、萧琛、范云、任昉、陆倕
• 谢朓是永明体成就最高的诗人

【历史意义】
• 使诗歌从自然的声韵美走向自觉的格律化
• 为唐代近体诗（律诗、绝句）的成熟奠定了理论和实践基础
• 是中国古典诗歌形式发展的重要转折点`,
  '近体诗：律诗、绝句，格律严谨': `近体诗是唐代形成的格律诗体，与古体诗相对，包括律诗和绝句两大类。

【律诗】
• 八句四联：首联、颔联、颈联、尾联
• 每句五言或七言
• 颔联、颈联必须对仗
• 押平声韵，一韵到底
• 讲究平仄黏对

【绝句】
• 四句，每句五言或七言
• 不要求对仗，但平仄和押韵有严格规定

【平仄规律】
平声为平，上、去、入三声为仄。诗句中平仄交替，形成节奏感和音乐美。

近体诗的格律严谨性使诗歌呈现出精致凝练的美感，成为唐诗乃至后世诗歌的主流形式。`,
  '李白（浪漫）、杜甫（写实）、白居易（新乐府）': `唐代三大诗人，代表了中国古典诗歌的三大高峰。

【李白（701—762年）】
• 字太白，号青莲居士，"诗仙"
• 浪漫主义高峰，诗风豪放飘逸、想象奇绝
• 代表作：《蜀道难》《将进酒》《望庐山瀑布》
• 善用夸张、想象，感情奔放，语言清新自然

【杜甫（712—770年）】
• 字子美，号少陵野老，"诗圣"
• 现实主义集大成者，诗风沉郁顿挫
• 代表作：《三吏》《三别》《春望》《登高》
• 诗被称为"诗史"，真实记录了安史之乱前后的社会现实

【白居易（772—846年）】
• 字乐天，号香山居士
• 倡导"新乐府运动"，主张"文章合为时而著，歌诗合为事而作"
• 代表作：《长恨歌》《琵琶行》《卖炭翁》
• 语言通俗易懂，追求"老妪能解"`,
  '婉约派：柳永、李清照': `婉约派是宋词两大流派之一，以婉转含蓄、缠绵悱恻为主要风格特征。

【柳永（约984—约1053年）】
• 北宋词人，原名三变，字耆卿
• 大力创作慢词（长调），扩展了词的篇幅和容量
• 多写都市繁华和歌妓生活，也有羁旅行役之作
• 代表作：《雨霖铃·寒蝉凄切》《八声甘州·对潇潇暮雨洒江天》
• 语言通俗，善用白描，"凡有井水处，即能歌柳词"

【李清照（1084—约1155年）】
• 号易安居士，宋代最杰出的女词人
• 词风前期清丽婉转，后期沉郁悲凉
• 提出词"别是一家"的主张，强调词的独立地位
• 代表作：《如梦令》《声声慢》《一剪梅》《醉花阴》
• 语言清新自然，善用口语，情感真挚细腻`,
  '豪放派：苏轼、辛弃疾': `豪放派是宋词的另一大流派，以气势雄浑、境界开阔为主要风格特征。

【苏轼（1037—1101年）】
• 字子瞻，号东坡居士，北宋文坛领袖
• 打破"词为艳科"的传统，以诗为词，拓宽了词的题材和意境
• 词风豪放旷达，亦有婉约之作
• 代表作：《念奴娇·赤壁怀古》《水调歌头·明月几时有》《江城子·密州出猎》
• 苏轼之后，词不再只是歌儿舞女的专利，而成为士大夫抒情言志的文学体裁

【辛弃疾（1140—1207年）】
• 字幼安，号稼轩，南宋爱国词人
• 一生以恢复中原为志，词中充满报国无门的悲愤
• 词风悲壮激昂，慷慨纵横，被誉为"词中之龙"
• 代表作：《永遇乐·京口北固亭怀古》《破阵子·为陈同甫赋壮词以寄之》《青玉案·元夕》
• 善用典故，气势磅礴，将豪放词推向顶峰`,
  '词合乐可歌，长短句为特征': `词是一种配合音乐歌唱的诗体，起源于隋唐，兴盛于宋代。

【音乐性】
• 词最初是"曲子词"，依曲调（词牌）填词
• 每首词都有一个词牌名，如《念奴娇》《水调歌头》等
• 词牌规定了词的句式、字数、平仄和押韵

【长短句】
• 与诗的整齐句式不同，词句式长短不齐
• 故又称"长短句"
• 这种灵活的句式更利于配合音乐的节奏变化

【别名】
• 诗余：意为诗的发展之余绪
• 乐府：继承了汉乐府合乐可歌的传统
• 琴趣：与音乐演奏相关

随着词乐失传，词逐渐脱离音乐，成为一种独立的文学体裁，但其音乐性的影响仍体现在格律之中。`,
  '散曲：小令、套数': `散曲是元代兴盛的一种合乐歌唱的韵文形式，与杂剧中的套曲相对。

【小令】
• 单片只曲，相当于一首单调的词
• 句式灵活，可加衬字
• 代表作：马致远《天净沙·秋思》（"枯藤老树昏鸦……"）

【套数（套曲/散套）】
• 由同一宫调的若干支曲子联缀而成
• 有首有尾，一韵到底
• 篇幅较长，可以表达较复杂的内容

【特点】
• 语言通俗活泼，大量运用口语和俗语
• 可加衬字，使句式更加灵活自由
• 风格明快爽朗，与词的婉转含蓄形成对比`,
  '通俗自然，贴近民间': `元曲最鲜明的艺术特征就是通俗化和市民化。

【语言特征】
• 大量使用口语、俗语、方言
• 不避粗俗，嬉笑怒骂皆成文章
• 与诗词的典雅含蓄形成鲜明对比

【内容题材】
• 反映市井生活、民间风情
• 描写男女爱情，大胆直率
• 抒发怀才不遇、厌世归隐之情
• 讽刺社会现实，批判官场腐败

【审美趣味】
• 追求"本色""自然"
• 反对堆砌辞藻，主张"文而不文，俗而不俗"
• 体现了元代市民阶层的审美趣味和文化需求

这种通俗自然的风格使元曲具有鲜活的生命力和广泛的群众基础。`,
  '元杂剧：关汉卿、马致远': `元杂剧是元代在宋金杂剧和诸宫调基础上发展起来的戏曲形式，代表了中国古典戏曲的第一个高峰。

【体制】
• 一般一本四折，每折由同一宫调的套曲组成
• 由男主角（正末）或女主角（正旦）一人主唱
• 科白（动作和对话）与曲词结合

【关汉卿】
• 号已斋叟，元杂剧的奠基人，"元曲四大家"之首
• 代表作：《窦娥冤》《救风尘》《单刀会》
• 《窦娥冤》是中国古代悲剧的典范，揭露了元代吏治的黑暗

【马致远】
• 号东篱，"曲状元"
• 代表作：《汉宫秋》（昭君出塞题材）
• 散曲《天净沙·秋思》被誉为"秋思之祖"
• 作品多写历史故事和神仙道化，意境苍凉悠远

元杂剧的出现标志着中国戏曲艺术走向成熟。`,
  '明代：前七子、后七子复古，公安派性灵': `明代诗歌流派纷呈，以复古与反复古的斗争为主线。

【前七子】
• 李梦阳、何景明等，活动于弘治、正德年间
• 主张"文必秦汉，诗必盛唐"
• 强调模拟古人，反对台阁体的平庸冗沓

【后七子】
• 李攀龙、王世贞等，活动于嘉靖年间
• 继承前七子复古主张，声势更盛
• 模拟之风更盛，流于形式主义

【公安派】
• 袁宗道、袁宏道、袁中道三兄弟，湖北公安人
• 主张"独抒性灵，不拘格套"
• 反对模拟古人，强调表现真情实感
• 语言通俗活泼，风格清新俊逸

明代诗歌的总体成就虽不及唐宋，但理论探索丰富，对清代诗论影响深远。`,
  '清代：神韵、格调、性灵、肌理四说并立': `清代是古典诗歌理论的集大成时期，四大诗说各树一帜。

【王士禛·神韵说】
• 强调诗歌应追求含蓄淡远、言有尽而意无穷的境界
• 推崇王维、孟浩然的山水田园诗

【沈德潜·格调说】
• 主张诗歌应温柔敦厚，合乎儒家诗教
• 强调格律声调，推崇盛唐气象

【袁枚·性灵说】
• 主张诗歌应表现真情实感和个性
• 反对模拟古人，强调"诗者，人之性情也"
• 影响最大，与明代公安派一脉相承

【翁方纲·肌理说】
• 主张以学问为诗，以考据入诗
• 强调诗歌的质实和条理

四说互有短长，反映了清代诗学的丰富性和复杂性。`,
  '小说戏曲鼎盛，诗歌难越唐宋': `明清两代，中国文学的重心逐渐从诗、词转向小说和戏曲。

【诗歌地位】
• 明代前后七子力主复古，但总体成就不及唐宋
• 清代诗人众多，流派纷呈，但缺乏开创性的大诗人
• 钱谦益、吴伟业、王士禛、袁枚、龚自珍等各有成就
• 诗歌创作在数量和理论总结上达到高峰，但艺术上难以超越唐宋

【小说鼎盛】
• 明代：《三国演义》《水浒传》《西游记》《金瓶梅》（"四大奇书"）
• 清代：《红楼梦》《儒林外史》《聊斋志异》
• 这些作品代表了中国古典小说的最高成就

【戏曲发展】
• 明代传奇兴盛：汤显祖《牡丹亭》、洪昇《长生殿》、孔尚任《桃花扇》
• 清代京剧形成，地方戏曲蓬勃发展

这一现象反映了文学从士大夫阶层向市民阶层的转移，以及叙事文学的崛起。`,
}

const TimelinePage: React.FC = () => {
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<TimelineNode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null)
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [evalVisible, setEvalVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const { marks, updateMark } = useTimelineMarks()

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await listTimelineNodes()
        setNodes(res.data)
      } catch (err) {
        console.error('Failed to load timeline nodes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNodes()
  }, [])

  useEffect(() => {
    if (selectedNode && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [selectedNode])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -400 : 400
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeSubProject(1)
      message.success('项目一已完成！')
      setCompleted(true)
      setEvalVisible(true)
    } catch (err: any) {
      if (err?.response?.status === 400) {
        message.info('该项目已完成')
        setCompleted(true)
        setEvalVisible(true)
      } else {
        message.error('操作失败')
      }
    } finally {
      setCompleting(false)
    }
  }

  // Find matching TimelineEra for selected node
  const selectedEra = selectedNode
    ? TIMELINE_ERAS.find(e => e.name === selectedNode.era) || null
    : null
  const prevEra = selectedEra
    ? TIMELINE_ERAS[TIMELINE_ERAS.findIndex(e => e.id === selectedEra.id) - 1]
    : undefined

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  // Split nodes into top and bottom rows
  const topRow = nodes.slice(0, Math.ceil(nodes.length / 2))
  const bottomRow = nodes.slice(Math.ceil(nodes.length / 2)).reverse()

  return (
    <Layout>
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/learning.png)' }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Title level={2} className="font-display !mb-2 text-mohei">
              经典常谈 · 诗第十二
            </Title>
            <Text className="text-danmo">
              从先秦到明清，追溯中国古典诗歌的发展脉络
            </Text>
          </div>

          {nodes.length === 0 ? (
            <Empty description="暂无时间轴数据" />
          ) : (
            <>
              {/* Classic Timeline */}
              <div className="relative mb-8 rounded-2xl p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #F5F2EB 0%, #EDE9E0 50%, #E8E4DC 100%)',
                  boxShadow: 'inset 0 0 60px rgba(139, 69, 19, 0.05)'
                }}>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #8B6914 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #8B4513 0%, transparent 70%)' }} />

                {/* Scroll buttons */}
                <button
                  onClick={() => scroll('left')}
                  aria-label="向左滚动"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-danmo-light"
                >
                  <ArrowLeftOutlined className="text-mohei" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  aria-label="向右滚动"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-danmo-light"
                >
                  <ArrowRightOutlined className="text-mohei" />
                </button>

                <div
                  ref={scrollRef}
                  className="overflow-x-auto hide-scrollbar px-10"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="relative min-w-max py-4">
                    {/* Top Row */}
                    <div className="flex items-end justify-center gap-6 mb-0 pb-6 relative"
                      style={{ paddingRight: '40px' }}>
                      {topRow.map((node, idx) => {
                        const isSelected = selectedNode?.id === node.id
                        const icon = eraIcons[node.era] || <BookOutlined />
                        const gradient = eraGradients[node.era] || 'from-danmo/20 to-danmo/10'
                        const borderColor = eraBorderColors[node.era] || 'border-danmo/30'
                        const isLastTop = idx === topRow.length - 1

                        return (
                          <div key={node.id} className="flex flex-col items-center relative"
                            style={{ minWidth: '180px', maxWidth: '200px' }}>
                            {/* Card */}
                            <div
                              className={`w-full rounded-xl border-2 bg-gradient-to-br ${gradient} ${borderColor} overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                                isSelected ? 'ring-2 ring-zhusha scale-105 shadow-xl' : 'shadow-md'
                              }`}
                              onClick={() => setSelectedNode(isSelected ? null : node)}
                              style={{ backgroundColor: 'rgba(255, 253, 248, 0.9)' }}
                            >
                              {/* Image area */}
                              <div className="h-28 w-full bg-gradient-to-b from-xuanzhi-warm to-white flex items-center justify-center relative overflow-hidden">
                                {node.image_url ? (
                                  <img
                                    src={node.image_url}
                                    alt={node.era}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <>
                                    <div className="absolute inset-0 opacity-20"
                                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                                    <div className="text-4xl opacity-40 text-zhusha">
                                      {icon}
                                    </div>
                                  </>
                                )}
                                {/* Decorative corner */}
                                <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-zhusha/20 rounded-tr-md" />
                                <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-zhusha/20 rounded-bl-md" />
                              </div>
                              {/* Content */}
                              <div className="p-3 text-center">
                                <Text className="text-sm font-medium text-mohei block leading-tight">
                                  {node.era}{node.title}
                                </Text>
                                <Text className="text-xs text-danmo mt-1 block">
                                  {node.period}
                                </Text>
                              </div>
                            </div>

                            {/* Connector line down to main axis */}
                            <div className="w-px h-5 bg-zhusha/60 mt-1" />

                            {/* Dot on main axis */}
                            <div className="w-3 h-3 rounded-full bg-zhusha border-2 border-white shadow-md z-10 relative" />

                            {/* Horizontal line to next */}
                            {!isLastTop && (
                              <div className="absolute bottom-0 left-1/2 w-full h-0.5 bg-gradient-to-r from-zhusha to-zhusha/60"
                                style={{ transform: 'translateY(-5px)' }} />
                            )}
                            {isLastTop && bottomRow.length > 0 && (
                              <div className="absolute bottom-0 left-1/2 w-full h-0.5 bg-gradient-to-r from-zhusha to-zhusha/60"
                                style={{ transform: 'translateY(-5px)' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Main Axis Line */}
                    <div className="relative h-1 mx-4" style={{ marginRight: '44px' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-zhusha via-zhusha-light to-zhusha rounded-full" />
                      {/* Arrow at the end */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
                        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                          <path d="M0 8H18M18 8L11 1M18 8L11 15" stroke="#C73E3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    {bottomRow.length > 0 && (
                      <div className="flex items-start justify-center gap-6 mt-0 pt-6 relative"
                        style={{ paddingRight: '40px' }}>
                        {bottomRow.map((node, idx) => {
                          const isSelected = selectedNode?.id === node.id
                          const icon = eraIcons[node.era] || <BookOutlined />
                          const gradient = eraGradients[node.era] || 'from-danmo/20 to-danmo/10'
                          const borderColor = eraBorderColors[node.era] || 'border-danmo/30'
                          const isLastBottom = idx === bottomRow.length - 1

                          return (
                            <div key={node.id} className="flex flex-col items-center relative"
                              style={{ minWidth: '180px', maxWidth: '200px' }}>
                              {/* Dot on main axis */}
                              <div className="w-3 h-3 rounded-full bg-zhusha border-2 border-white shadow-md z-10 relative mb-1" />

                              {/* Connector line up from main axis */}
                              <div className="w-px h-5 bg-zhusha/60 mb-1" />

                              {/* Horizontal line from prev */}
                              {!isLastBottom && (
                                <div className="absolute top-0 left-1/2 w-full h-0.5 bg-gradient-to-r from-zhusha/60 to-zhusha"
                                  style={{ transform: 'translateY(-5px)' }} />
                              )}

                              {/* Card */}
                              <div
                                className={`w-full rounded-xl border-2 bg-gradient-to-br ${gradient} ${borderColor} overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                                  isSelected ? 'ring-2 ring-zhusha scale-105 shadow-xl' : 'shadow-md'
                                }`}
                                onClick={() => setSelectedNode(isSelected ? null : node)}
                                style={{ backgroundColor: 'rgba(255, 253, 248, 0.9)' }}
                              >
                                {/* Image area */}
                                <div className="h-28 w-full bg-gradient-to-b from-xuanzhi-warm to-white flex items-center justify-center relative overflow-hidden">
                                  {node.image_url ? (
                                    <img
                                      src={node.image_url}
                                      alt={node.era}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <>
                                      <div className="absolute inset-0 opacity-20"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                                      <div className="text-4xl opacity-40 text-zhusha">
                                        {icon}
                                      </div>
                                    </>
                                  )}
                                  <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-zhusha/20 rounded-tr-md" />
                                  <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-zhusha/20 rounded-bl-md" />
                                </div>
                                {/* Content */}
                                <div className="p-3 text-center">
                                  <Text className="text-sm font-medium text-mohei block leading-tight">
                                    {node.era}{node.title}
                                  </Text>
                                  <Text className="text-xs text-danmo mt-1 block">
                                    {node.period}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Panel */}
              {selectedNode && selectedEra && (
                <div ref={detailRef} className="mb-8">
                  <EraDetailPanel
                    era={selectedEra}
                    prevEra={prevEra}
                    mark={marks[selectedEra.id]}
                    onMarkChange={updateMark}
                    node={selectedNode}
                    keyPointDetails={keyPointDetails}
                  />
                </div>
              )}

              {/* Complete button */}
              <div className="text-center py-8 border-t border-danmo-light">
                {completed ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-zhuqing">
                      <CheckCircleOutlined />
                      <Text className="text-zhuqing font-medium">已完成典籍时间轴学习</Text>
                    </div>
                    <Button customVariant="ghost" customSize="sm" onClick={() => navigate('/learning')}>
                      返回学习中心
                    </Button>
                  </div>
                ) : (
                  <Button
                    customVariant="primary"
                    onClick={handleComplete}
                    loading={completing}
                  >
                    <EditOutlined /> 完成典籍时间轴学习
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title="项目评价量表"
        open={evalVisible}
        onCancel={() => setEvalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EvaluationForm
          subProjectId={1}
          onSaved={() => {
            setEvalVisible(false)
            navigate('/learning')
          }}
        />
      </Modal>
    </Layout>
  )
}

export default TimelinePage
