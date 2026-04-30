export interface ClassicWork {
  id: string;
  name: string;
  alias: string;
  period: string;
  positioning: string;
  chapterId: number;
  zhuQuote: string;
}

export interface TimelineEra {
  id: string;
  name: string;
  periodRange: string;
  summary: string;
  transitionToNext?: string;
  works: ClassicWork[];
  eraQuote: string;
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'xianqin',
    name: '先秦',
    periodRange: '西周—战国',
    summary: '中华文明奠基期，文字、哲学、诗歌的源头',
    transitionToNext: '秦汉之际，典籍遭焚毁，汉初求书之路开启',
    eraQuote: '中国文字相传是黄帝的史官叫仓颉的造的。这仓颉据说有四只眼睛，他看见了地上的兽蹄儿、鸟爪儿印着的痕迹，灵感涌上心头，便造起文字来。',
    works: [
      {
        id: 'shuowen',
        name: '《说文解字》',
        alias: '文字之源',
        period: '东汉',
        positioning: '中国第一部系统的字书，文字学的古典',
        chapterId: 1,
        zhuQuote: '东汉和帝时，有个许慎，作了一部《说文解字》。这是一部划时代的字书。经典和别的字书里的字，他都搜罗在他的书里，所以有九千字。',
      },
      {
        id: 'zhouyi',
        name: '《周易》',
        alias: '阴阳之书',
        period: '殷周之际',
        positioning: '中国古代哲学与卜筮的经典，阴阳变化之理',
        chapterId: 2,
        zhuQuote: '八卦相传是伏羲氏画的。八卦原只是八个不同的符号，每个符号代表一种事物。譬如"乾"代表天，"坤"代表地。',
      },
      {
        id: 'shangshu',
        name: '《尚书》',
        alias: '上古之书',
        period: '商周',
        positioning: '中国最古的记言的历史，政治文献之祖',
        chapterId: 3,
        zhuQuote: '《尚书》是中国最古的记言的历史。所谓记言，其实也是记事，不过是一种特别的方式罢了。',
      },
      {
        id: 'shijing',
        name: '《诗经》',
        alias: '诗之源头',
        period: '西周初年至春秋中叶',
        positioning: '中国最早的诗歌总集，现实主义源头',
        chapterId: 4,
        zhuQuote: '诗的源头是歌谣。上古时候，没有文字，只有唱的歌谣，没有写的诗。一个人高兴的时候或悲哀的时候，常愿意将自己的心情诉说出来。',
      },
    ],
  },
  {
    id: 'han',
    name: '汉代',
    periodRange: '西汉—东汉',
    summary: '经学兴盛，史书奠基，礼乐制度集大成',
    transitionToNext: '汉末乱世，经学衰落，玄学兴起，文学自觉时代来临',
    eraQuote: '汉代所谓"礼学"，便专指《仪礼》而言。后来范围渐渐扩大，三礼都包括在内了。',
    works: [
      {
        id: 'sanli',
        name: '《三礼》',
        alias: '礼乐之典',
        period: '周代—汉代',
        positioning: '周礼、仪礼、礼记，古代礼乐制度的总结',
        chapterId: 5,
        zhuQuote: '三礼是指《周礼》《仪礼》《礼记》。《仪礼》是宗教仪式、风俗习惯的记录，是礼的本经。',
      },
      {
        id: 'chunqiu',
        name: '《春秋》三传',
        alias: '春秋笔法',
        period: '春秋—汉代',
        positioning: '编年体史书的开创，微言大义的典范',
        chapterId: 6,
        zhuQuote: '《春秋》只是鲁国史官的旧文，孔子不曾掺进手去。但是《春秋》的文字极简单，只有大纲，没有细节，所以后人必须加以解释。',
      },
      {
        id: 'shiji',
        name: '《史记》《汉书》',
        alias: '史家双璧',
        period: '西汉—东汉',
        positioning: '纪传体史书的开创，史家之绝唱',
        chapterId: 9,
        zhuQuote: '说起中国的史书，《史记》《汉书》，真是无人不知，无人不晓。这两部书，可以说是中国史书的祖宗。',
      },
    ],
  },
  {
    id: 'weijin',
    name: '魏晋南北朝',
    periodRange: '220—589',
    summary: '玄学兴起，文学自觉，百家争鸣后的思想融合',
    transitionToNext: '南北朝交融，声律说兴，为唐诗格律奠基',
    eraQuote: '到了战国，这种情形更加显著。各国的君主，为了富国强兵，争相招揽人才。',
    works: [
      {
        id: 'sishu',
        name: '《四书》',
        alias: '圣贤之书',
        period: '战国—南宋编定',
        positioning: '儒家核心经典，科举考试的准绳',
        chapterId: 7,
        zhuQuote: '"四书五经"，是儒家的经典。四书是《大学》《中庸》《论语》《孟子》，是南宋朱熹编定的。',
      },
      {
        id: 'zhuzi',
        name: '《诸子》',
        alias: '百家争鸣',
        period: '春秋战国',
        positioning: '儒道墨法名阴阳，中国古代思想的源头活水',
        chapterId: 10,
        zhuQuote: '所谓"诸子百家"，最重要的有儒、道、墨、法、名、阴阳六家。',
      },
      {
        id: 'zhanguoce',
        name: '《战国策》',
        alias: '纵横之策',
        period: '战国—秦汉',
        positioning: '纵横家言行的记录，策士文风的典范',
        chapterId: 8,
        zhuQuote: '记载这些策士言行的书，便是《战国策》。这部书不是一人一时所作，大概是秦汉间人杂采各国的史料编成的。',
      },
    ],
  },
  {
    id: 'tang',
    name: '唐代',
    periodRange: '618—907',
    summary: '诗歌的黄金时代，格律成熟，大家辈出',
    transitionToNext: '唐音落幕，宋调初起，词体兴盛，理学渐成',
    eraQuote: '到了唐代，诗歌发展到了顶峰。唐代诗人辈出，名家如云。',
    works: [
      {
        id: 'cifu',
        name: '《辞赋》',
        alias: '楚辞汉赋',
        period: '战国—汉',
        positioning: '从屈原《离骚》到汉赋铺陈，诗歌的浪漫主义源头',
        chapterId: 11,
        zhuQuote: '屈原因遭谗言，被楚怀王放逐。他心中忧愤，写下了《离骚》。"离骚"就是"遭忧"的意思。',
      },
      {
        id: 'shige',
        name: '《诗歌》',
        alias: '诗之江河',
        period: '汉—唐',
        positioning: '从汉乐府到唐诗格律，中国古典诗歌的成熟',
        chapterId: 12,
        zhuQuote: '汉武帝立乐府，采集代、赵、秦、楚的歌谣和乐谱，教李延年作协律都尉，负责整理那些歌辞和谱子。',
      },
    ],
  },
  {
    id: 'song',
    name: '宋代',
    periodRange: '960—1279',
    summary: '词的盛世，理学兴起，古文运动集大成',
    transitionToNext: '宋亡元兴，俗文学崛起，戏曲散曲登堂入室',
    eraQuote: '宋代是词的盛世。词是配合音乐歌唱的诗体，句子长短不齐，所以又叫"长短句"。',
    works: [
      {
        id: 'shige-song',
        name: '《诗歌》·宋诗',
        alias: '宋调新声',
        period: '宋代',
        positioning: '唐诗之后的另辟蹊径，理趣入诗',
        chapterId: 12,
        zhuQuote: '诗到唐代，已经达到了顶峰。后人作诗，很难超越唐人。所以宋人另辟蹊径，发展词体。',
      },
      {
        id: 'zhuzi-song',
        name: '《诸子》·理学',
        alias: '理学新诠',
        period: '宋代',
        positioning: '朱熹集注四书，儒学哲学化的巅峰',
        chapterId: 10,
        zhuQuote: '诸子的学说，虽然各不相同，但是都是为了解决当时社会的实际问题。',
      },
    ],
  },
  {
    id: 'yuan',
    name: '元代',
    periodRange: '1271—1368',
    summary: '经典流传·承上启下——俗文学崛起，戏曲散曲登堂入室',
    transitionToNext: '元曲之后，小说鼎盛，古典文学最后一次集大成',
    eraQuote: '诗、词、曲，一脉相承，构成了中国古典诗歌的灿烂长河。',
    works: [
      {
        id: 'sanqu',
        name: '散曲',
        alias: '弦歌新唱',
        period: '元代',
        positioning: '诗余之变，市井之音，元曲之先声',
        chapterId: 12,
        zhuQuote: '元代，曲又兴起了。诗、词、曲，一脉相承，构成了中国古典诗歌的灿烂长河。',
      },
      {
        id: 'zaju',
        name: '元杂剧',
        alias: '梨园新声',
        period: '元代',
        positioning: '戏曲艺术的成熟，俗文学的巅峰',
        chapterId: 12,
        zhuQuote: '诗、词、曲，一脉相承，构成了中国古典诗歌的灿烂长河。',
      },
    ],
  },
  {
    id: 'mingqing',
    name: '明清',
    periodRange: '1368—1912',
    summary: '小说鼎盛，诗歌集大成，古典文学的最后一次辉煌',
    eraQuote: '明清两代，散文的流派很多。明代有"前后七子"，主张"文必秦汉"。',
    works: [
      {
        id: 'wen',
        name: '《文》',
        alias: '文之脉络',
        period: '先秦—明清',
        positioning: '从卜辞到古文运动，中国散文的完整历程',
        chapterId: 13,
        zhuQuote: '现存的中国最早的文，是商代的卜辞。这是甲骨上的文字，是史官占卜的记录。',
      },
      {
        id: 'xiaoshuo',
        name: '小说戏曲',
        alias: '俗文学巅峰',
        period: '明清',
        positioning: '四大奇书与红楼梦，叙事文学的集大成',
        chapterId: 13,
        zhuQuote: '明清两代，散文的流派很多。但是总的来说，明清散文成就不如唐宋。',
      },
    ],
  },
];

