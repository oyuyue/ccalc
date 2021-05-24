import { calc } from './interpreter'

window.onload = function() {
  const num = document.querySelector('#nums')
  const unit = document.querySelector('#units')
  const op = document.querySelector('#ops')
  const inp = document.querySelector('#inp')
  const equal = document.querySelector('#equal')
  const clear = document.querySelector('#clear')
  const records = document.querySelector('#records')
  let lastRecord = null
  let nums = ''; let units = ''; let ops = '';
  '零壹贰叁肆伍陆柒捌玖'.split('').forEach((ch) => {
    nums += `<div class="btn" data-ch="${ch}">${ch}</div>`
  })
  '拾佰仟万亿'.split('').forEach((ch) => {
    units += `<div class="btn" data-ch="${ch}">${ch}</div>`
  })
  ;["加", "减", "乘", "除", "左括号", "右括号"].forEach((ch) => {
    ops += `<div class="btn" data-ch="${ch}">${ch}</div>`
  })
  num.innerHTML = nums;
  unit.innerHTML = units;
  op.innerHTML = ops;

  num.onclick = unit.onclick = op.onclick = (ev) => {
    const ch = ev.target.dataset.ch
    if (ch) {
      inp.value += ch
      inp.focus()
    }
  }
  clear.onclick = () => { inp.value = ''; inp.focus() }
  function submit() {
    if (!inp.value) return;
    const record = document.createElement('div')
    record.classList.add('record')
    let ret = ''
    try {
      ret = calc(inp.value)
    } catch (err) {
      ret = err
    }
    record.innerHTML = `
      <div class="flex-center">
        <div class="record_time">${new Date().toLocaleString()}</div>
        <div>${inp.value}</div>
      </div>
      <div class="record_ans">${ret}</div>
    `
    records.insertBefore(record, lastRecord)
    lastRecord = record
    inp.value = ''
    inp.focus()
  }
  inp.onkeydown = (ev) => { if ((ev.keyCode || ev.which) == 13) {submit()} }
  equal.onclick = submit
}
