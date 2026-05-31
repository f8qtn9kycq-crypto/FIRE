import { useMemo, useRef, useState } from "react";

export const FIRE_BEGINNER_FAQ_ZH_TW = [
  {
    id: "faq-1-what-is-fire",
    question: "什麼是 FIRE？跟一般提早退休有什麼不同？",
    answer:
      "FIRE 是「財務自由、提早退休」的縮寫。重點不是一定要很早離職，而是先建立一筆可以支撐生活費的資產池，讓你「可以選擇工作」而不是被迫工作。當投資被動收入大致可以覆蓋長期生活支出時，就接近 FIRE 的狀態。",
  },
  {
    id: "faq-2-25x-rule",
    question: "為什麼大家說可以先用「年支出 × 25」估算 FIRE 目標？",
    answer:
      "這個經典近似是從 4% 規則反推回來的：如果你每年大約提領資產的 4% 作為生活費，那資產大約需要是年支出的 25 倍。實務上，本 app 會再把年支出通膨到退休當年，再用你設定的安全提領率反推，更貼近台灣人的實際情境。",
  },
  {
    id: "faq-3-swr-why-3-5",
    question: "安全提領率是什麼？為什麼預設是 3.5% 而不是 4%？",
    answer:
      "安全提領率是指你每年大約可以提領多少比例的資產，在長壽和市場波動下仍有較高機率不把錢花光。早期研究常用 4%，但考慮到退休時間越來越長、未來報酬可能低於過去，以及通膨和稅務等風險，本 app 預設用 3.5% 當作比較保守的起點。",
  },
  {
    id: "faq-4-how-to-estimate-expenses",
    question: "我要怎麼抓自己的「今日年支出」？要含哪些項目？",
    answer:
      "建議先用記帳工具抓出過去 3-6 個月的平均月支出，再乘以 12 當作今日年支出。吃住行、房租或房貸、保險、交通、小孩教育、孝親金、娛樂等固定開銷都要算進去；若未來預期會多出特別支出（例如養小孩、長照），可以直接在年支出裡預留緩衝。",
  },
  {
    id: "faq-5-why-inflation-matters",
    question: "台灣通膨看起來不高，為什麼還要特別設定「通膨率」？",
    answer:
      "就算官方通膨率看起來不高，房租、餐飲、醫療與服務費用仍會慢慢上升。退休可能長達 30-40 年，只用今天的物價去扣未來的生活費會低估需求。本 app 會先用你設定的通膨率，把今日年支出推算到退休當年的水準，再繼續往後調整，反映長期物價變化。",
  },
  {
    id: "faq-6-currency-and-wan-unit",
    question: "為什麼輸入金額用「萬」？幣別切換成 USD 實際在算什麼？",
    answer:
      "台灣人在談資產時習慣用「幾十萬、幾百萬」，所以本 app 直接用「萬」為單位，避免出現一長串零。幣別切換成 TWD 或 USD 時，你看到的只是顯示介面，內部計算會先把各種幣別換算回新台幣，再用同一套模型計算，避免同一個數字在不同幣別下被誤解。",
  },
  {
    id: "faq-7-cash-vs-investments",
    question: "現金、投資、每年投入分別代表什麼？為什麼現金沒有 7% 報酬？",
    answer:
      "「現金」代表你打算維持在活存、定存或短期預備金的部位，本 app 不假設這一塊有明顯投資報酬；「投資」代表目前已經投入市場的總額；「每年投入」代表未來每一年固定會新投入市場的金額。只有投資與每年投入會套用你設定的退休前年報酬率做複利，這樣比較符合多數人的真實資產配置。",
  },
  {
    id: "faq-8-pre-retirement-growth",
    question: "退休前資產的成長，在模型裡大致怎麼算？",
    answer:
      "模型會從你現在的投資金額開始，每一年先把這筆錢用你設定的退休前年報酬率做複利成長，再加上當年的固定投入金額。這個流程會一路重複到你設定的退休年齡，最後再把現金儲蓄加進去，形成退休當年的總資產。",
  },
  {
    id: "faq-9-fire-target-definition",
    question: "FIRE 目標在 app 裡的精確定義是什麼？",
    answer:
      "在本 app 裡，FIRE 目標會先把今天的年支出，依照你設定的通膨率推算到退休當年的「退休時年支出」，再用安全提領率（例如 3.5%）反推需要多少本金。換句話說，它是在問：退休那一年開始，我需要多少資產，才能每年提領這筆通膨後支出。",
  },
  {
    id: "faq-10-when-am-i-fire",
    question: "什麼情況會被判定成「已經 FIRE」？",
    answer:
      "如果以今天的角度，你目前的總資產（現金加投資）已經大於或等於「今日年支出 ÷ 安全提領率」，app 會視為你已經達到當下版本的 FIRE 門檻。如果你是規劃未來某年退休，則會另外看退休當年的總資產是否已經超過「退休時年支出 ÷ 安全提領率」來判斷。",
  },
  {
    id: "faq-11-withdrawal-and-tax",
    question: "畫面上的「稅前提領」跟實際能用的「生活費」有什麼差？",
    answer:
      "你輸入的年支出與圖表上的生活費，都代表你想要實際可以花掉的「稅後金額」。如果你設定有資本利得稅，本 app 會用一個簡單的公式把這個稅後金額反推成稅前提領金額，例如：稅前提領 = 通膨後支出 ÷ (1 - 資本利得稅率)，確保扣完稅後仍然有足夠金額支應生活。",
  },
  {
    id: "faq-12-tax-taiwan",
    question: "台灣幾乎沒有股票資本利得稅，那資本利得稅率欄位要怎麼填？",
    answer:
      "目前台股價差一般沒有資本利得稅，所以如果你的退休收入幾乎都來自台灣股票或 ETF 買賣，可以把資本利得稅率設為 0%。不過，海外 ETF、債券、股利或租金收入仍可能被課稅，如果你預期會有這些來源，可以保守估一個稅率填入，讓模型更貼近真實現金流。",
  },
  {
    id: "faq-13-bear-scenario",
    question: "熊市情境是怎麼設計的？為什麼要連續壓力測試好幾年？",
    answer:
      "真正的熊市通常是連續幾年報酬不佳，而不是單一年份大跌。為了模擬這種壓力，本 app 的熊市情境會在退休初期連續幾年給出較差的年報酬率，並同時扣除通膨後支出，之後才回到你設定的平均退休後報酬率。這樣可以觀察在壞情境下，你的資產最早會在哪個年齡耗盡。",
  },
  {
    id: "faq-14-sequence-risk",
    question: "什麼是「報酬順序風險」？為什麼退休一開始跌比較傷？",
    answer:
      "報酬順序風險指的是「同樣的長期平均報酬，如果先跌後漲，結果會比先漲後跌差很多」。退休後你每年都要固定提領生活費，如果前幾年就遇到大跌，你是在資產被打折的情況下持續提領，等於雙重壓力；之後就算市場回升，剩下的資產可能已經不足以完全跟上。",
  },
  {
    id: "faq-15-monte-carlo",
    question: "蒙地卡羅模擬顯示的「成功機率」要怎麼看？",
    answer:
      "蒙地卡羅模擬會根據你設定的平均報酬率與波動，每一年隨機抽一個報酬，重複跑出很多種可能的退休路徑。成功機率代表在這些路徑中，有多少比例的情況下，你的資產都能存活到預設規劃年齡。成功機率越高，代表整體計畫在各種市場環境下的穩定度越高，但永遠不代表「零風險」。",
  },
  {
    id: "faq-16-projection-chart",
    question: "預測圖上的「基準曲線」和「熊市曲線」要怎麼解讀？",
    answer:
      "基準曲線是依照你設定的退休後報酬率、通膨率與生活支出，逐年推算資產變化的結果。熊市曲線則是假設一開始幾年遇到較差報酬，長期平均類似，但前期比較慘，用來對照在壞情境下資產會不會提早歸零、最早可能撐到幾歲。兩條線差距越大，代表你對報酬順序風險越敏感。",
  },
];

function FAQItem({ item, open, onToggle, refCallback }) {
  return (
    <div ref={refCallback} className={`faq-item ${open ? "is-open" : ""}`}>
      <button type="button" className="faq-question" aria-expanded={open} onClick={onToggle}>
        <span>{item.question}</span>
        <span className="faq-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-answer">{item.answer}</div>}
    </div>
  );
}

export default function FAQ({ onBack }) {
  const [openId, setOpenId] = useState(FIRE_BEGINNER_FAQ_ZH_TW[0].id);
  const itemRefs = useRef({});
  const selectedItem = useMemo(
    () => FIRE_BEGINNER_FAQ_ZH_TW.find((item) => item.id === openId),
    [openId],
  );

  const scrollToItem = (itemId) => {
    requestAnimationFrame(() => {
      itemRefs.current[itemId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openFaqItem = (itemId) => {
    setOpenId(itemId);
    scrollToItem(itemId);
  };

  const toggleItem = (itemId) => {
    const nextId = openId === itemId ? null : itemId;
    setOpenId(nextId);

    if (nextId) {
      scrollToItem(nextId);
    }
  };

  return (
    <div className="guide-shell">
      <div className="guide-header">
        <button type="button" onClick={onBack} className="secondary-nav-button">
          返回計算機
        </button>
        <div style={{ fontSize: 13, color: "#C8A96E", textTransform: "uppercase", marginBottom: 3 }}>FIRE 入門</div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>常見問題</div>
        <div style={{ fontSize: 15, color: "#5C5A55", marginTop: 6, lineHeight: 1.6 }}>
          用一般人聽得懂的方式，說明 FIRE、提領率、通膨、稅務與模擬結果。
        </div>
      </div>

      <div className="faq-layout">
        <div className="faq-jump">
          <div style={{ fontSize: 15, color: "#6B6963", marginBottom: 10 }}>快速瀏覽</div>
          {FIRE_BEGINNER_FAQ_ZH_TW.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`faq-jump-button ${openId === item.id ? "is-active" : ""}`}
              onClick={() => openFaqItem(item.id)}
            >
              {index + 1}. {item.question}
            </button>
          ))}
        </div>

        <div className="faq-list">
          {selectedItem && (
            <div className="faq-feature">
              <div style={{ fontSize: 13, color: "#C8A96E", textTransform: "uppercase", marginBottom: 8 }}>目前閱讀</div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.45, marginBottom: 10 }}>{selectedItem.question}</div>
              <div style={{ fontSize: 16, color: "#B0ADA6", lineHeight: 1.8 }}>{selectedItem.answer}</div>
            </div>
          )}

          {FIRE_BEGINNER_FAQ_ZH_TW.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => toggleItem(item.id)}
              refCallback={(el) => {
                itemRefs.current[item.id] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
