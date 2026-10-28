import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:5173"
const output = new URL("../evidence/input-quality/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL("fixture.tsx", output), `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';import'../../src/index.css';
import{Input}from'../../src/components/ui/input';import{Textarea}from'../../src/components/ui/textarea';import{Label}from'../../src/components/ui/label';
import{InputGroup,InputGroupInput,InputGroupAddon}from'../../src/components/ui/input-group';
import{Combobox,ComboboxInputGroup,ComboboxInput,ComboboxTrigger,ComboboxContent,ComboboxList,ComboboxItem,ComboboxClear}from'../../src/components/ui/combobox';import{Mentions,Mention}from'../../src/components/ui/mentions';
import{InputTag}from'../../src/components/ui/input-tag';import{Cascader}from'../../src/components/ui/cascader';import{TreeSelect}from'../../src/components/ui/tree-select';
import{Calendar}from'../../src/components/ui/calendar';import{DateField,TimeField,DateLocaleProvider}from'../../src/components/ui/date-field';import{DatePicker,DateRangePicker}from'../../src/components/ui/date-picker';import{CalendarDate,Time}from'@internationalized/date';
import{PeriodPicker}from'../../src/components/ui/period-picker';import{GradientPicker}from'../../src/components/ui/gradient-picker';import{ColorPicker}from'../../src/components/ui/color-picker';
import{Transfer}from'../../src/components/ui/transfer';import{Rating}from'../../src/components/ui/rating';import{FileUpload,FileUploadList}from'../../src/components/ui/file-upload';
import{Checkbox}from'../../src/components/ui/checkbox';import{CheckboxGroup}from'../../src/components/ui/checkbox-group';import{Switch}from'../../src/components/ui/switch';import{RadioGroup,RadioGroupItem}from'../../src/components/ui/radio-group';
import{Toggle}from'../../src/components/ui/toggle';import{ToggleGroup,ToggleGroupItem}from'../../src/components/ui/toggle-group';import{ButtonGroup}from'../../src/components/ui/button-group';import{Button}from'../../src/components/ui/button';
import{NumberField,NumberFieldGroup,NumberFieldInput,NumberFieldIncrement,NumberFieldDecrement}from'../../src/components/ui/number-field';import{Slider}from'../../src/components/ui/slider';import{OTPField}from'../../src/components/ui/otp-field';
import{SearchField}from'../../src/components/ui/search-field';import{PasswordInput}from'../../src/components/ui/password-input';
import{Form,FormField,FormFieldLabel,FormFieldError,FormFieldControl}from'../../src/components/ui/form';import{Fieldset,FieldsetLegend}from'../../src/components/ui/fieldset';
import{Field,FieldLabel,FieldDescription,FieldError}from'../../src/components/ui/field';import{OptionSelect}from'../../src/components/ui/option-select';
const params=new URLSearchParams(location.search);document.documentElement.dataset.density=params.get('density')||'compact';document.documentElement.classList.toggle('dark',params.get('theme')==='dark');
const long='AnExtremelyLongCategoryLabelWithoutBreaks'.repeat(4);
const stableOptions=[{id:'alpha',label:'Alpha',children:[{id:'a',label:'Alpha child'}]},{id:'beta',label:'Beta',children:[{id:'b',label:'Beta child'}]}];
function Fixture(){
const[stablePath,setStablePath]=useState([]);const[count,setCount]=useState(0);
const[combo,setCombo]=useState('Alpha');const[mention,setMention]=useState('');const[plainMention,setPlainMention]=useState('');
const[tags,setTags]=useState(['alpha','beta']);const[path,setPath]=useState(['region','leaf']);const[tree,setTree]=useState([]);const[targets,setTargets]=useState([]);const[search,setSearch]=useState('query');
const[gradient,setGradient]=useState({type:'linear',angle:90,stops:[{id:'a',color:'#4433ee',offset:0},{id:'b',color:'#ffaa00',offset:100}]});const[files,setFiles]=useState([]);const[rejections,setRejections]=useState([]);const[submitted,setSubmitted]=useState(false);
return <main style={{padding:16,display:'grid',gridTemplateColumns:'minmax(0,1fr)',gap:24,maxWidth:760}}>
<style>{'main > section{min-width:0}output{display:block;overflow-wrap:anywhere}'}</style><section id="native"><Label htmlFor="native-input">Name</Label><Input id="native-input" name="name" defaultValue="Alex"/><Textarea aria-label="Read only notes" readOnly defaultValue="Stable notes"/><Input aria-label="Disabled input" disabled defaultValue="Disabled"/>
<InputGroup id="short-group" style={{'--ds-input-control-height':'24px','--ds-input-padding-x':'20px'}}><InputGroupAddon>@</InputGroupAddon><InputGroupInput aria-label="Short group"/></InputGroup>
<InputGroup id="tall-group" style={{'--ds-input-control-height':'52px'}}><InputGroupAddon>@</InputGroupAddon><InputGroupInput aria-label="Tall group"/></InputGroup>
<SearchField aria-label="Search records" value={search} onValueChange={setSearch}/><SearchField aria-label="Read only search" value="Retained" readOnly onValueChange={()=>{throw Error('Read-only search changed')}}/><PasswordInput aria-label="Secret" defaultValue="example-secret"/>
<Field data-invalid="true"><FieldLabel htmlFor="error-input">Invalid input</FieldLabel><Input id="error-input" aria-invalid="true" aria-describedby="error-description error-message"/><FieldDescription id="error-description">Format</FieldDescription><FieldError id="error-message">Invalid format</FieldError></Field>
</section>
<section id="tags"><form id="external-tags"/><Label htmlFor="tag-input">External tags</Label><InputTag id="tag-input" form="external-tags" name="tags" value={tags} onValueChange={setTags} maxTags={3}/><InputTag aria-label="Read only tags" name="readonly-tags" value={['fixed']} onValueChange={()=>{throw Error('Readonly tags changed')}} readOnly/><output id="tag-value">{JSON.stringify(tags)}</output></section>
<section id="choices"><CheckboxGroup aria-label="Channels" defaultValue={['mail']}><label><Checkbox value="mail"/>Mail</label><label><Checkbox value="sms"/>SMS</label><label><Checkbox value="disabled" disabled/>Disabled channel</label></CheckboxGroup><label><Checkbox aria-label="Partial" indeterminate/>Partial</label><label><Switch defaultChecked/>Notifications</label><label><Switch readOnly defaultChecked/>Read only switch</label><RadioGroup aria-label="Plan" defaultValue="basic"><label><RadioGroupItem value="basic"/>Basic</label><label><RadioGroupItem value="blocked" disabled/>Blocked</label><label><RadioGroupItem value="pro"/>Pro</label></RadioGroup><Toggle aria-label="Bold">B</Toggle><ToggleGroup aria-label="Alignment" defaultValue={['left']}><ToggleGroupItem value="left">Left</ToggleGroupItem><ToggleGroupItem value="center" disabled>Center</ToggleGroupItem><ToggleGroupItem value="right">Right</ToggleGroupItem></ToggleGroup><ButtonGroup aria-label="Actions"><Button>Save</Button><Button disabled>Publish</Button></ButtonGroup><Button disabled focusableWhenDisabled onClick={()=>{throw Error("Disabled action activated")}}>Unavailable action</Button><Button disabled nativeButton={false} role="link" render={<a href="#unavailable"/>}>Unavailable link</Button></section>
<section id="numbers"><NumberField min={0} max={3} defaultValue={2}><NumberFieldGroup><NumberFieldDecrement/><NumberFieldInput aria-label="Quantity"/><NumberFieldIncrement/></NumberFieldGroup></NumberField><NumberField readOnly defaultValue={2}><NumberFieldGroup><NumberFieldDecrement/><NumberFieldInput aria-label="Read only quantity"/><NumberFieldIncrement/></NumberFieldGroup></NumberField><Slider defaultValue={[20,80]} min={0} max={100} getAriaLabel={i=>i===0?'Lower limit':'Upper limit'}/><OTPField length={4} aria-label="Verification code"/><Rating label="Score" defaultValue={2} allowClear/><Rating label="Read only score" value={2.5} readOnly/></section>
<section id="select"><OptionSelect defaultValue="a" options={[{value:'a',label:'Alpha'},{value:'blocked',label:'Blocked',disabled:true},{value:'b',label:long}]} triggerProps={{'aria-label':'Single option'}}/><OptionSelect defaultValue="compact" options={[{value:'compact',label:'Compact'},{value:'comfortable',label:'Comfortable'}]} triggerProps={{'aria-label':'Density choice',style:{width:130}}}/></section>
<section id="suggestions"><Combobox items={['Alpha','Beta']} value={combo} onValueChange={setCombo}><ComboboxInputGroup><ComboboxInput aria-label="Team suggestion"/><ComboboxTrigger/><ComboboxClear/></ComboboxInputGroup><ComboboxContent><ComboboxList>{item=><ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><output id="combo-value">{combo}</output><Mentions aria-label="Mention note" value={mention} onMentionsChange={change=>{setMention(change.value);setPlainMention(change.plainTextValue)}}><Mention trigger="@" data={[{id:'alex',display:'Alex'},{id:'jamie',display:'Jamie'}]} appendSpaceOnAdd/></Mentions><output id="mention-value">{plainMention}</output></section><section id="cascader"><Cascader label="Location" options={[{id:'region',label:'Region',children:[{id:'leaf',label:'Leaf'},{id:'blocked',label:'Blocked',disabled:true},{id:'long',label:long}]},{id:'other',label:'Other'}]} value={path} onValueChange={setPath}/><output id="path-value">{JSON.stringify(path)}</output></section>
<section id="stable-cascader"><Cascader label="Stable paths" options={stableOptions} value={stablePath} changeOnSelect onValueChange={value=>{setStablePath(value);setCount(count+1)}}/><output id="stable-count">{count}</output></section>
<section id="tree"><TreeSelect label="Folders" selectionMode="multiple" items={[{id:'enabled',label:'Enabled'},{id:'disabled',label:'Disabled',disabled:true},{id:'branch',label:'Branch',children:[{id:'child',label:'Child'}]}]} selectedKeys={tree} onSelectionChange={setTree} defaultExpandedKeys={['branch']}/><output id="tree-value">{JSON.stringify(tree)}</output></section>
<section id="transfer"><Transfer items={[{id:'one',label:'One'},{id:'two',label:'Two'},{id:'blocked',label:'Blocked',disabled:true}]} targetKeys={targets} onTargetKeysChange={setTargets}/><output id="target-value">{JSON.stringify(targets)}</output></section>
<section id="dates"><DateField label="Date" defaultValue={new CalendarDate(2026,10,28)}/><TimeField label="Time" defaultValue={new Time(10,30)}/><DatePicker label="Choose date" defaultValue={new CalendarDate(2026,10,28)}/><DateRangePicker label="Date range" defaultValue={{start:new CalendarDate(2026,10,20),end:new CalendarDate(2026,10,28)}}/><DateField label="Read only date" isReadOnly defaultValue={new CalendarDate(2026,10,28)}/><DateField label="Invalid date" isInvalid errorMessage="Outside the allowed range" defaultValue={new CalendarDate(2026,10,28)}/><PeriodPicker mode="month" label="Reporting period" defaultValue={{type:'month',year:2026,month:10}} isClearable minValue={new CalendarDate(2026,10,1)} maxValue={new CalendarDate(2026,12,31)}/><PeriodPicker mode="year" label="Read only period" defaultValue={{type:'year',year:2026}} isReadOnly isClearable/><PeriodPicker mode="quarter" label="Quarter" defaultValue={{type:'quarter',year:2026,quarter:2}}/><PeriodPicker mode="year" label="Year" defaultValue={{type:'year',year:2026}}/><PeriodPicker mode="week" label="Week" defaultValue={{type:'week',start:new CalendarDate(2026,10,26)}}/><div id="rtl-calendar" dir="rtl"><DateLocaleProvider locale="ar-AE"><Calendar aria-label="RTL calendar" defaultValue={new CalendarDate(2026,10,28)}/></DateLocaleProvider></div></section>
<section id="color"><ColorPicker label="Accent" defaultValue="#3377dd" showAlpha/><ColorPicker label="Disabled accent" defaultValue="#445566" isDisabled/><GradientPicker value={gradient} onValueChange={setGradient}/><output id="gradient-value">{JSON.stringify(gradient)}</output></section>
<section id="files"><FileUpload accept=".txt" maxFiles={2} existingCount={files.length} maxSize={10} onFilesAccepted={next=>setFiles(current=>[...current,...next.map((f,i)=>({id:f.name+i,name:f.name,size:f.size}))])} onFilesRejected={setRejections}/><FileUploadList files={files} onRemove={file=>setFiles(current=>current.filter(f=>f.id!==file.id))}/><output id="rejection-value">{JSON.stringify(rejections.map(r=>r.code))}</output></section>
<Form onFormSubmit={()=>setSubmitted(true)}><Fieldset><FieldsetLegend>Account</FieldsetLegend><FormField name="email"><FormFieldLabel>Email</FormFieldLabel><FormFieldControl render={<Input/>} type="email" required/><FormFieldError/></FormField><Button type="submit">Submit account</Button></Fieldset></Form><output id="submitted">{String(submitted)}</output>
</main>}
createRoot(document.getElementById('root')).render(<Fixture/>);
`)

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { cases: [], matrix: [], errors: [] }
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  page.setDefaultTimeout(10000)
  page.on("pageerror", error => report.errors.push(error.message))
  await page.goto(`${origin}/evidence/input-quality/fixture.html`)
  await page.getByLabel("External tags", { exact: true }).waitFor()
  const diagnostic = await page.evaluate(() => ({ tags: new FormData(document.querySelector('#external-tags')).getAll('tags'), short: document.querySelector('#short-group').getBoundingClientRect().height, tall: document.querySelector('#tall-group').getBoundingClientRect().height, rtlPrevious: document.querySelector('#rtl-calendar .evenform-calendar-nav svg').getAttribute('class') }))
  assert.deepEqual(diagnostic.tags, ['alpha', 'beta'])
  assert.equal(diagnostic.short, 24)
  assert.equal(diagnostic.tall, 52)
  assert.equal(await page.locator('#short-group').evaluate(e => getComputedStyle(e).paddingLeft), '20px')
  assert.match(diagnostic.rtlPrevious, /chevron-right/)
  const tagInput = page.getByLabel('External tags', { exact: true })
  await tagInput.fill('gamma'); await tagInput.press('Enter')
  assert.equal(await page.locator('#tag-value').innerText(), '["alpha","beta","gamma"]')
  await tagInput.fill('alpha'); await tagInput.press('Enter')
  assert.equal(await tagInput.getAttribute('aria-invalid'), 'true')
  await tagInput.fill(''); await tagInput.press('Backspace')
  assert(await page.getByRole('button', { name: 'Remove gamma' }).evaluate(e => e === document.activeElement))
  await page.keyboard.press('Delete')
  await page.waitForFunction(() => document.activeElement?.id === 'tag-input')
  assert.deepEqual(await page.evaluate(() => new FormData(document.querySelector('#external-tags')).getAll('tags')), ['alpha', 'beta'])
  await tagInput.fill('composition')
  await tagInput.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true })
  assert.equal(await page.locator('#tag-value').innerText(), '["alpha","beta"]')
  assert.equal(await page.getByRole('button', { name: 'Remove fixed' }).count(), 0)
  report.cases.push('External form tags, add/reject/remove, focus restoration, composition and read-only tags')

  assert.equal(await page.getByRole('checkbox', { name: 'Partial', exact: true }).getAttribute('aria-checked'), 'mixed')
  assert.equal(await page.getByRole('checkbox', { name: 'Partial', exact: true }).locator('.lucide-minus').count(), 1)
  await page.getByRole('checkbox', { name: 'SMS', exact: true }).press('Space')
  assert.equal(await page.getByRole('checkbox', { name: 'SMS', exact: true }).getAttribute('aria-checked'), 'true')
  assert(await page.getByRole('checkbox', { name: 'Disabled channel' }).isDisabled())
  await page.getByRole('switch', { name: 'Notifications', exact: true }).press('Space')
  assert.equal(await page.getByRole('switch', { name: 'Notifications', exact: true }).getAttribute('aria-checked'), 'false')
  await page.getByRole('switch', { name: 'Read only switch' }).press('Space')
  assert.equal(await page.getByRole('switch', { name: 'Read only switch' }).getAttribute('aria-checked'), 'true')
  await page.getByRole('radio', { name: 'Basic', exact: true }).press('ArrowRight')
  assert.equal(await page.getByRole('radio', { name: 'Pro', exact: true }).getAttribute('aria-checked'), 'true')
  await page.getByRole('button', { name: 'Bold', exact: true }).press('Space')
  assert.equal(await page.getByRole('button', { name: 'Bold', exact: true }).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: 'Left', exact: true }).press('ArrowRight')
  await page.keyboard.press('Space')
  assert.equal(await page.getByRole('button', { name: 'Right', exact: true }).getAttribute('aria-pressed'), 'true')
  const unavailable = page.getByRole('button', { name: 'Unavailable action' })
  await unavailable.focus(); await page.keyboard.press('Enter')
  assert(await unavailable.evaluate(e => e === document.activeElement))
  for (const control of [unavailable, page.getByRole('link', { name: 'Unavailable link' })]) {
    assert.equal(await control.getAttribute('aria-disabled'), 'true')
    assert.equal(await control.evaluate(e => getComputedStyle(e).opacity), '0.5')
  }
  report.cases.push('Checkbox group/mixed appearance, switches, disabled-skipping radio/toggle arrows, focusable disabled buttons')

  const quantity = page.getByRole('textbox', { name: 'Quantity', exact: true })
  await quantity.press('ArrowUp'); await quantity.press('ArrowUp')
  assert.equal(await quantity.inputValue(), '3')
  assert(await page.locator('#numbers').getByRole('button', { name: 'Increase', exact: true }).first().isDisabled())
  const readonlyQuantity = page.getByRole('textbox', { name: 'Read only quantity' })
  await readonlyQuantity.press('ArrowUp')
  assert.equal(await readonlyQuantity.inputValue(), '2')
  const lower = page.getByRole('slider', { name: 'Lower limit' })
  await lower.press('ArrowRight')
  assert.equal(await lower.getAttribute('aria-valuenow'), '21')
  const otp = page.getByRole('group', { name: 'Verification code' }).getByRole('textbox')
  await otp.first().fill('1234')
  assert.deepEqual(await otp.evaluateAll(elements => elements.map(e => e.value)), ['1', '2', '3', '4'])
  const rating = page.getByRole('group', { name: 'Score', exact: true })
  await rating.getByRole('radio', { name: '2 of 5 stars' }).press('ArrowRight')
  assert(await rating.getByRole('radio', { name: '3 of 5 stars' }).isChecked())
  await rating.getByRole('button', { name: 'Clear rating' }).click()
  assert.equal(await rating.getByRole('radio', { checked: true }).count(), 0)
  assert.equal(await page.getByRole('group', { name: 'Read only score' }).getByRole('radio').count(), 0)
  await page.getByRole('button', { name: 'Clear search' }).click()
  assert.equal(await page.getByRole('searchbox', { name: 'Search records' }).inputValue(), '')
  assert(await page.getByRole('searchbox', { name: 'Search records' }).evaluate(e => e === document.activeElement))
  await page.getByRole('button', { name: 'Show password' }).click()
  assert.equal(await page.getByLabel('Secret', { exact: true }).getAttribute('type'), 'text')
  await page.getByRole('button', { name: 'Hide password' }).click()
  assert.equal(await page.getByLabel('Secret', { exact: true }).getAttribute('type'), 'password')
  report.cases.push('Number bounds/read-only, slider keyboard, OTP distribution, editable/read-only rating, search and password actions')

  const combo = page.getByRole('combobox', { name: 'Team suggestion' })
  await combo.fill('Be')
  await page.getByRole('option', { name: 'Beta', exact: true }).waitFor()
  await combo.press('ArrowDown'); await combo.press('Enter')
  assert.equal(await page.locator('#combo-value').innerText(), 'Beta')
  await page.locator('#suggestions').getByRole('button', { name: 'Clear selection' }).click()
  assert.equal(await combo.inputValue(), '')
  assert(await combo.evaluate(e => e === document.activeElement))
  const mention = page.getByLabel('Mention note', { exact: true })
  await mention.fill('@al')
  await page.getByRole('option', { name: 'Alex', exact: true }).waitFor()
  await mention.press('Enter')
  assert.match(await page.locator('#mention-value').innerText(), /Alex/)
  assert.equal(await page.getByRole('option', { name: 'Alex', exact: true }).count(), 0)
  report.cases.push('Combobox filter/keyboard selection/clear focus and Mentions keyboard insertion')

  const cascader = page.getByRole("button", { name: "Location Region / Leaf" })
  await cascader.click()
  await page.getByRole("option", { name: "Leaf", exact: true }).press('Enter')
  await page.locator('.evenform-cascader-popup').waitFor({ state: 'hidden' })
  assert.equal(await cascader.getAttribute('aria-expanded'), 'false')
  await cascader.click()
  assert(await page.getByRole('option', { name: 'Blocked', exact: true }).isDisabled())
  const longOption = page.getByRole('option', { name: /^AnExtremelyLongCategory/ })
  assert(await longOption.evaluate(e => e.scrollWidth <= e.clientWidth))
  await page.keyboard.press('Escape')
  await page.locator('.evenform-cascader-popup').waitFor({ state: 'hidden' })
  await page.getByRole('button', { name: 'Clear path' }).press('Enter')
  assert.equal(await page.locator('#path-value').innerText(), '[]')
  assert(await page.locator('#cascader .evenform-cascader-trigger').evaluate(e => e === document.activeElement))
  await page.getByRole('button', { name: 'Stable paths Choose a path…' }).click()
  await page.getByRole('option', { name: 'Alpha', exact: true }).click()
  assert.equal(await page.locator('#stable-count').innerText(), '1')
  await page.getByRole('option', { name: 'Beta', exact: true }).click()
  assert.equal(await page.locator('#stable-count').innerText(), '2')
  await page.keyboard.press('Escape')
  report.cases.push('Stable Cascader options invoke the latest controlled callback across parent selections')
  await page.getByRole('button',{name:'Folders Choose…'}).click()
  const tree = page.getByRole('treegrid')
  await tree.getByRole('row').first().press('ControlOrMeta+a')
  assert.deepEqual(JSON.parse(await page.locator('#tree-value').innerText()), ['enabled', 'branch', 'child'])
  await page.keyboard.press('Escape')
  await page.locator('.evenform-tree-select-popup').waitFor({ state: 'hidden' })
  const source = page.getByRole('group', { name: /^Available/ })
  await source.getByRole('checkbox', { name: 'One', exact: true }).check()
  await page.getByRole('button', { name: 'Add selected' }).click()
  assert.equal(await page.locator('#target-value').innerText(), '["one"]')
  await source.getByRole('checkbox', { name: /^Select all shown/ }).check()
  await page.getByRole('button', { name: 'Add selected' }).click()
  assert.equal(await page.locator('#target-value').innerText(), '["one","two"]')
  assert(await source.getByRole('checkbox', { name: 'Blocked', exact: true }).isDisabled())
  report.cases.push('Cascader reselect/dismiss/clear focus/long labels, TreeSelect select-all excludes disabled, Transfer excludes disabled')

  const dateMonth = page.getByRole('spinbutton', { name: 'month, Date', exact: true })
  await dateMonth.press('ArrowUp')
  assert.equal(await dateMonth.getAttribute('aria-valuenow'), '11')
  const minute = page.getByRole('spinbutton', { name: 'minute, Time', exact: true })
  await minute.press('ArrowUp')
  assert.equal(await minute.getAttribute('aria-valuenow'), '31')
  const readOnlyMonth = page.getByRole('spinbutton', { name: 'month, Read only date', exact: true })
  await readOnlyMonth.press('ArrowUp')
  assert.equal(await readOnlyMonth.getAttribute('aria-valuenow'), '10')
  assert.equal(await page.getByRole('spinbutton', { name: 'month, Invalid date', exact: true }).getAttribute('aria-invalid'), 'true')
  const dateTrigger = page.getByRole('button', { name: 'Calendar Choose date', exact: true })
  await dateTrigger.press('Enter')
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert(await dateTrigger.evaluate(e => e === document.activeElement))
  await page.getByRole('button', { name: 'Calendar Date range', exact: true }).click()
  await page.getByRole('gridcell', { name: /Monday, October 5, 2026/ }).getByRole('button').click()
  await page.getByRole('gridcell', { name: /Saturday, October 10, 2026/ }).getByRole('button').click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('spinbutton', { name: 'day, Start Date, Date range', exact: true }).getAttribute('aria-valuenow'), '5')
  assert.equal(await page.getByRole('spinbutton', { name: 'day, End Date, Date range', exact: true }).getAttribute('aria-valuenow'), '10')
  const period = page.getByRole('button', { name: 'Reporting period October 2026' })
  await period.press('Enter')
  assert(await page.getByRole('option', { name: 'Sep', exact: true }).isDisabled())
  await page.getByRole('option', { name: 'Nov', exact: true }).press('Enter')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(await page.getByRole('button', { name: 'Reporting period November 2026' }).count(), 1)
  await page.getByRole('button', { name: 'Clear period', exact: true }).first().press('Enter')
  assert(await page.getByRole('button', { name: 'Reporting period Choose a period…' }).evaluate(e => e === document.activeElement))
  assert(await page.getByRole('button', { name: 'Read only period 2026' }).isDisabled())
  for (const label of ['Quarter', 'Year', 'Week']) {
    const trigger = page.getByRole('button', { name: new RegExp('^' + label + ' ') })
    const previous = await trigger.innerText()
    await trigger.press('Enter')
    await page.getByRole('option').first().press('Enter')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.notEqual(await trigger.innerText(), previous)
  }
  await page.locator('#rtl-calendar .evenform-calendar-nav').first().press('Enter')
  assert.match(await page.locator('#rtl-calendar .evenform-calendar-header').innerText(), /سبتمبر/)
  report.cases.push('Date segment keyboard/read-only/errors, picker Escape focus, period boundaries/selection/read-only and RTL month navigation')

  const accent = page.getByRole('group', { name: 'Accent', exact: true })
  const hue = accent.getByRole('slider', { name: 'Hue', exact: true })
  const previousHue = Number(await hue.inputValue())
  await hue.press('ArrowRight')
  assert.equal(Number(await hue.inputValue()), previousHue + 1)
  assert(await page.getByRole('group', { name: 'Disabled accent', exact: true }).getByRole('slider', { name: 'Hue', exact: true }).isDisabled())
  await page.getByRole('button', { name: 'Add stop' }).press('Enter')
  assert.equal(JSON.parse(await page.locator('#gradient-value').innerText()).stops.length, 3)
  await page.getByRole('button', { name: 'Remove stop 3' }).press('Enter')
  assert.equal(JSON.parse(await page.locator('#gradient-value').innerText()).stops.length, 2)
  assert(await page.getByRole('button', { name: 'Add stop' }).evaluate(e => e === document.activeElement))
  assert(await page.getByRole('button', { name: 'Remove stop 1' }).isDisabled())
  await page.getByRole('button', { name: 'Reverse stops' }).click()
  assert.deepEqual(JSON.parse(await page.locator('#gradient-value').innerText()).stops.map(s => s.offset), [100, 0])
  await page.getByRole('radio', { name: 'Radial', exact: true }).check()
  assert.equal(await page.getByRole('slider', { name: 'Gradient angle' }).count(), 0)
  report.cases.push('Color keyboard/disabled, gradient stop addition/removal focus/minimum/reversal/type')

  const upload = page.locator('#files input[type=file]')
  await upload.setInputFiles([{ name: 'good.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') }, { name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('bad') }])
  assert.equal(await page.locator('#files').getByRole('listitem').count(), 1)
  assert.equal(await page.locator('#rejection-value').innerText(), '["file-type"]')
  await upload.setInputFiles({ name: 'huge.txt', mimeType: 'text/plain', buffer: Buffer.from('too much file content') })
  assert.equal(await page.locator('#rejection-value').innerText(), '["file-size"]')
  await page.getByRole('button', { name: 'Remove good.txt' }).click()
  assert.equal(await page.locator('#files').getByRole('listitem').count(), 0)
  await page.waitForFunction(() => document.activeElement?.matches('.evenform-file-list'))
  await page.getByRole('button', { name: 'Submit account' }).click()
  assert.equal(await page.locator('#submitted').innerText(), 'false')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com')
  await page.getByRole('button', { name: 'Submit account' }).click()
  assert.equal(await page.locator('#submitted').innerText(), 'true')
  report.cases.push('File type/size validation, removal, and native required-email form submission')

  for (const width of [320, 1280]) for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: width === 320, reducedMotion: 'reduce' })
    const matrixPage = await context.newPage()
    matrixPage.setDefaultTimeout(10000)
    matrixPage.on('pageerror', error => report.errors.push(error.message))
    await matrixPage.goto(`${origin}/evidence/input-quality/fixture.html?theme=${theme}&density=${density}`)
    await matrixPage.getByRole('combobox', { name: 'Density choice' }).click()
    const comfortable = matrixPage.getByRole('option', { name: 'Comfortable', exact: true })
    const optionGeometry = await comfortable.evaluate(element => {
      const span = element.firstElementChild; const range = document.createRange(); range.selectNodeContents(span)
      return { textRects: range.getClientRects().length, optionHeight: element.getBoundingClientRect().height, scrollWidth: document.documentElement.scrollWidth, popup: document.querySelector('[data-slot="select-content"]').getBoundingClientRect().toJSON(), viewport: innerWidth }
    })
    assert.equal(optionGeometry.textRects, 1, 'A short option must fit on one line')
    assert(optionGeometry.popup.x >= 0 && optionGeometry.popup.right <= width, 'Select popup must stay within the viewport')
    if (width === 320) assert(optionGeometry.optionHeight >= 44)
    await matrixPage.keyboard.press('Escape')
    await matrixPage.getByRole('listbox').waitFor({ state: 'hidden' })
    const partial = matrixPage.getByRole('checkbox', { name: 'Partial', exact: true })
    const selectedMail = matrixPage.getByRole('checkbox', { name: 'Mail', exact: true })
    assert.equal(await partial.evaluate(e => getComputedStyle(e).backgroundColor), await selectedMail.evaluate(e => getComputedStyle(e).backgroundColor))
    assert.equal(await matrixPage.getByRole('checkbox', { name: 'Disabled channel' }).evaluate(e => getComputedStyle(e).opacity), '0.5')
    if (width === 320) {
      const calendar = matrixPage.locator('#rtl-calendar .evenform-calendar')
      assert.equal(await calendar.evaluate(e => getComputedStyle(e).overflowX), 'auto')
      assert(await calendar.evaluate(e => { e.scrollLeft = -100; return e.scrollLeft < 0 }), 'Narrow RTL calendar dates must remain horizontally reachable')
    }
    const bounds = await matrixPage.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
    assert(bounds.scroll <= bounds.width, 'Controls must not widen the document')
    report.matrix.push({ width, theme, density, optionGeometry, bounds })
    await matrixPage.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
    await matrixPage.screenshot({ path: new URL(`inputs-${width}-${theme}-${density}.png`, output).pathname, fullPage: true })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  report.result = 'pass'
  console.log(`PASS ${report.cases.length} input interaction groups and ${report.matrix.length} theme/density/viewport cases`)
} catch (error) {
  report.failure = error.stack
  throw error
} finally {
  await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
