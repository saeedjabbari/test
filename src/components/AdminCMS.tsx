import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { MedicalCenter } from '../data/centers';
import { toFa } from '../utils/persian';
import {
  getMergedCenters,
  saveCenterRecord,
  deleteCenterRecord,
  generateMapUrls,
  parseCoordinates,
  extractStreetsFromAddress,
  URMIA_STREETS_MAP,
  getCenterOverrides,
  getCustomCenters,
} from '../utils/centerStore';
import {
  FileSpreadsheet,
  Upload,
  FileText,
  PlusCircle,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Edit2,
  Navigation,
  X,
  Compass,
  Map,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminCMSProps {
  showToast: (msg: string) => void;
  onCentersUpdated?: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({ showToast, onCentersUpdated }) => {
  // Sub-tabs: 'excel' | 'text' | 'form' | 'list'
  const [subTab, setSubTab] = useState<'excel' | 'text' | 'form' | 'list'>('list');

  // Centers version counter to trigger reactive re-fetch
  const [version, setVersion] = useState(0);

  const reloadData = () => {
    setVersion((v) => v + 1);
    onCentersUpdated?.();
  };

  useEffect(() => {
    const handleUpdate = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener('krf_centers_updated', handleUpdate);
    return () => window.removeEventListener('krf_centers_updated', handleUpdate);
  }, []);

  // Merged total centers with robust overrides and custom additions
  const allCenters = useMemo(() => {
    return getMergedCenters();
  }, [version]);

  const overridesMap = useMemo(() => {
    return getCenterOverrides();
  }, [version]);

  const customCentersList = useMemo(() => {
    return getCustomCenters();
  }, [version]);

  // --- 1. EXCEL IMPORT STATE & LOGIC ---
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const [excelPreview, setExcelPreview] = useState<Partial<MedicalCenter>[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExcelUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          showToast('فایل انتخابی خالی است');
          setIsExcelUploading(false);
          return;
        }

        // Parse rows
        const parsed: Partial<MedicalCenter>[] = data.map((row: any) => {
          const name = row['نام مرکز'] || row['نام'] || row['عنوان'] || row['Name'] || '';
          const type = row['نوع مرکز'] || row['نوع'] || row['دسته‌بندی'] || row['دسته'] || row['Type'] || 'سایر';
          const address = row['نشانی'] || row['آدرس'] || row['Address'] || '';
          const phone = String(row['تلفن'] || row['شماره تلفن'] || row['تلفن تماس'] || row['Phone'] || '').trim();
          const specialty = row['تخصص'] || row['خدمات'] || row['توضیحات'] || '';
          const isNight =
            String(row['شبانه‌روزی'] || row['شیفت شب'] || row['NightShift'] || '')
              .toLowerCase()
              .includes('بله') ||
            String(row['شبانه‌روزی'] || '').includes('true') ||
            String(row['شبانه‌روزی'] || '').includes('1');

          // Parse coordinates if provided in Excel
          let lat: number | undefined;
          let lng: number | undefined;

          const rawLat = row['عرض جغرافیایی'] || row['lat'] || row['Lat'] || row['Latitude'];
          const rawLng = row['طول جغرافیایی'] || row['lng'] || row['Lng'] || row['Longitude'];
          const rawCoords = row['مختصات'] || row['Coordinates'] || row['موقعیت'];

          if (rawCoords) {
            const p = parseCoordinates(String(rawCoords));
            if (p) {
              lat = p.lat;
              lng = p.lng;
            }
          } else if (rawLat && rawLng) {
            const pLat = parseFloat(String(rawLat));
            const pLng = parseFloat(String(rawLng));
            if (!isNaN(pLat) && !isNaN(pLng)) {
              lat = pLat;
              lng = pLng;
            }
          }

          const streets = extractStreetsFromAddress(address);
          const firstStreet = streets[0];
          const defaultCoords = URMIA_STREETS_MAP[firstStreet] || { lat: 37.545, lng: 45.07 };

          const finalLat = lat || defaultCoords.lat;
          const finalLng = lng || defaultCoords.lng;

          const mapUrls = generateMapUrls(finalLat, finalLng, name, address);

          // Custom map URLs if provided in columns
          const neshanUrl = row['لینک نشان'] || row['نشان'] || mapUrls.neshanUrl;
          const baladUrl = row['لینک بلد'] || row['بلد'] || mapUrls.baladUrl;
          const googleMapUrl = row['لینک گوگل مپ'] || row['گوگل مپ'] || mapUrls.googleMapUrl;

          return {
            name,
            type,
            address,
            phone,
            specialty,
            isNightShift: isNight,
            streets,
            lat: finalLat,
            lng: finalLng,
            neshanUrl,
            baladUrl,
            googleMapUrl,
            ownership: 'طرف قرارداد کارآفرین',
            id: '',
            phoneWarn: '',
            pid: '',
            alt: [name, phone, address],
          };
        });

        // Filter out empty rows
        const valid = parsed.filter((p) => p.name && p.name.trim().length > 0);
        setExcelPreview(valid);
        showToast(`${toFa(valid.length)} مرکز از فایل اکسل استخراج شد. لطفاً بررسی فرمایید.`);
      } catch (err: any) {
        console.error(err);
        showToast('خطا در خواندن فایل اکسل. مطمئن شوید فرمت xlsx یا csv معتبر است.');
      } finally {
        setIsExcelUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleApplyExcelData = () => {
    if (excelPreview.length === 0) return;

    let nextK = Math.max(...allCenters.map((c) => c.k || 0), 140) + 1;
    excelPreview.forEach((item) => {
      const newCenter: MedicalCenter = {
        k: nextK++,
        name: item.name || 'مرکز جدید',
        id: item.id || '',
        address: item.address || '',
        phone: item.phone || '',
        ownership: item.ownership || 'خصوصی',
        type: item.type || 'سایر',
        phoneWarn: '',
        streets: item.streets && item.streets.length > 0 ? item.streets : ['سایر'],
        pid: '',
        isNightShift: Boolean(item.isNightShift),
        specialty: item.specialty || '',
        lat: item.lat,
        lng: item.lng,
        neshanUrl: item.neshanUrl,
        baladUrl: item.baladUrl,
        googleMapUrl: item.googleMapUrl,
        alt: item.alt || [item.name || '', item.phone || ''],
      };
      saveCenterRecord(newCenter);
    });

    showToast(`${toFa(excelPreview.length)} مرکز جدید همراه با دیتای مسیریابی ذخیره شد!`);
    setExcelPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    reloadData();
    setSubTab('list');
  };

  // Download Sample Excel Template with Routing Columns
  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      {
        'نام مرکز': 'آزمایشگاه ژنوم',
        'نوع مرکز': 'آزمایشگاه',
        نشانی: 'ارومیه، خیابان حسنی، مجتمع پزشکی پارس',
        تلفن: '04433444829',
        شبانه‌روزی: 'خیر',
        تخصص: 'آزمایشگاه تشخیص طبی و ژنتیک',
        'عرض جغرافیایی (Lat)': 37.5371423441005,
        'طول جغرافیایی (Lng)': 45.04976799759771,
        'لینک نشان': 'https://nshn.ir/?lat=37.5371423441005&lng=45.04976799759771',
        'لینک بلد': 'https://balad.ir/location?latitude=37.5371423441005&longitude=45.04976799759771',
        'لینک گوگل مپ': 'https://www.google.com/maps/search/?api=1&query=37.5371423441005,45.04976799759771',
      },
      {
        'نام مرکز': 'داروخانه دکتر جوانبخت',
        'نوع مرکز': 'داروخانه',
        نشانی: 'ارومیه، خیابان خیام شمالی، جنب ساختمان پزشکان بوعلی',
        تلفن: '04432221234',
        شبانه‌روزی: 'بله',
        تخصص: 'داروهای تخصصی و مکمل‌های کمیاب',
        'عرض جغرافیایی (Lat)': 37.548005,
        'طول جغرافیایی (Lng)': 45.065708,
        'لینک نشان': 'https://nshn.ir/?lat=37.548005&lng=45.065708',
        'لینک بلد': 'https://balad.ir/location?latitude=37.548005&longitude=45.065708',
        'لینک گوگل مپ': 'https://www.google.com/maps/search/?api=1&query=37.548005,45.065708',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب_مراکز');
    XLSX.writeFile(wb, 'قالب_استاندارد_مراکز_درمانی_کارآفرین.xlsx');
  };

  // --- 2. SMART TEXT PARSER STATE & LOGIC ---
  const [textInput, setTextInput] = useState('');
  const [textPreview, setTextPreview] = useState<Partial<MedicalCenter>[]>([]);

  const handleParseText = () => {
    if (!textInput.trim()) {
      showToast('لطفاً متن مشخصات مراکز را وارد فرمایید');
      return;
    }

    const blocks = textInput.split(/\n\s*\n/);
    const parsed: Partial<MedicalCenter>[] = [];

    blocks.forEach((block) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      let name = '';
      let type = 'سایر';
      let address = '';
      let phone = '';
      let specialty = '';
      let isNightShift = false;
      let lat: number | undefined;
      let lng: number | undefined;
      let customBaladUrl = '';
      let customNeshanUrl = '';
      let customGoogleUrl = '';

      lines.forEach((line, idx) => {
        // Detect coordinates in line (e.g. 37.547549, 45.066955)
        const coords = parseCoordinates(line);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          return;
        }

        // Detect Map URLs
        if (line.includes('balad.ir')) {
          customBaladUrl = line.match(/https?:\/\/[^\s]+/)?.[0] || line;
          return;
        }
        if (line.includes('nshn.ir')) {
          customNeshanUrl = line.match(/https?:\/\/[^\s]+/)?.[0] || line;
          return;
        }
        if (line.includes('google.com/maps')) {
          customGoogleUrl = line.match(/https?:\/\/[^\s]+/)?.[0] || line;
          return;
        }

        if (idx === 0 && !line.includes(':') && !line.includes('：')) {
          name = line.replace(/^(مرکز|دکتر|درمانگاه|آزمایشگاه|داروخانه)\s+/i, '$1 ');
          return;
        }

        const lower = line.toLowerCase();
        if (lower.startsWith('نام:') || lower.startsWith('نام مرکز:')) {
          name = line.split(/[:：]/)[1]?.trim() || name;
        } else if (lower.startsWith('نوع:') || lower.startsWith('نوع مرکز:') || lower.startsWith('دسته‌بندی:')) {
          type = line.split(/[:：]/)[1]?.trim() || type;
        } else if (lower.startsWith('نشانی:') || lower.startsWith('آدرس:') || lower.startsWith('محل:')) {
          address = line.split(/[:：]/)[1]?.trim() || address;
        } else if (lower.startsWith('تلفن:') || lower.startsWith('شماره:') || lower.startsWith('تماس:')) {
          phone = line.split(/[:：]/)[1]?.trim() || phone;
        } else if (lower.startsWith('تخصص:') || lower.startsWith('خدمات:')) {
          specialty = line.split(/[:：]/)[1]?.trim() || specialty;
        } else if (lower.includes('شبانه‌روزی') || lower.includes('شبانه روزی') || lower.includes('24 ساعته')) {
          isNightShift = true;
        } else if (!address && (line.includes('خیابان') || line.includes('کوچه') || line.includes('ارومیه') || line.includes('ساختمان'))) {
          address = line;
        } else if (!phone && /(\d{7,11})/.test(line)) {
          phone = line.match(/(\d{7,11})/)?.[1] || '';
        }
      });

      if (name) {
        const streets = extractStreetsFromAddress(address);
        const defaultCoords = URMIA_STREETS_MAP[streets[0]] || { lat: 37.545, lng: 45.07 };
        const finalLat = lat || defaultCoords.lat;
        const finalLng = lng || defaultCoords.lng;
        const mapUrls = generateMapUrls(finalLat, finalLng, name, address);

        parsed.push({
          name,
          type,
          address,
          phone,
          specialty,
          isNightShift,
          streets,
          lat: finalLat,
          lng: finalLng,
          ownership: 'طرف قرارداد کارآفرین',
          neshanUrl: customNeshanUrl || mapUrls.neshanUrl,
          baladUrl: customBaladUrl || mapUrls.baladUrl,
          googleMapUrl: customGoogleUrl || mapUrls.googleMapUrl,
        });
      }
    });

    if (parsed.length === 0) {
      showToast('هیچ مرکزی از متن شناسایی نشد. لطفاً قالب متن را بررسی فرمایید.');
      return;
    }

    setTextPreview(parsed);
    showToast(`${toFa(parsed.length)} مرکز با موفقیت از متن شناسایی شد!`);
  };

  const handleApplyTextData = () => {
    if (textPreview.length === 0) return;

    let nextK = Math.max(...allCenters.map((c) => c.k || 0), 140) + 1;
    textPreview.forEach((item) => {
      const newCenter: MedicalCenter = {
        k: nextK++,
        name: item.name || 'مرکز جدید',
        id: item.id || '',
        address: item.address || '',
        phone: item.phone || '',
        ownership: item.ownership || 'خصوصی',
        type: item.type || 'سایر',
        phoneWarn: '',
        streets: item.streets && item.streets.length > 0 ? item.streets : ['سایر'],
        pid: '',
        isNightShift: Boolean(item.isNightShift),
        specialty: item.specialty || '',
        lat: item.lat,
        lng: item.lng,
        neshanUrl: item.neshanUrl,
        baladUrl: item.baladUrl,
        googleMapUrl: item.googleMapUrl,
        alt: [item.name || '', item.phone || '', item.address || ''],
      };
      saveCenterRecord(newCenter);
    });

    showToast(`${toFa(textPreview.length)} مرکز جدید همراه با لینک‌های مسیریابی اضافه شد`);
    setTextPreview([]);
    setTextInput('');
    reloadData();
    setSubTab('list');
  };

  // --- 3. SINGLE MANUAL FORM STATE & LOGIC ---
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('آزمایشگاه');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formIsNightShift, setFormIsNightShift] = useState(false);
  const [formStreet, setFormStreet] = useState('حسنی');

  // Routing fields for manual form
  const [formLat, setFormLat] = useState<string>('37.5365');
  const [formLng, setFormLng] = useState<string>('45.0642');
  const [coordsPaste, setCoordsPaste] = useState('');
  const [formNeshanUrl, setFormNeshanUrl] = useState('');
  const [formBaladUrl, setFormBaladUrl] = useState('');
  const [formGoogleMapUrl, setFormGoogleMapUrl] = useState('');

  // Handle Street selection in form to auto-suggest coordinates
  const handleStreetChange = (st: string) => {
    setFormStreet(st);
    const coords = URMIA_STREETS_MAP[st];
    if (coords) {
      setFormLat(coords.lat.toString());
      setFormLng(coords.lng.toString());
      const urls = generateMapUrls(coords.lat, coords.lng, formName, formAddress);
      setFormNeshanUrl(urls.neshanUrl);
      setFormBaladUrl(urls.baladUrl);
      setFormGoogleMapUrl(urls.googleMapUrl);
    }
  };

  // Handle paste coordinates in manual form
  const handleCoordsPaste = (raw: string) => {
    setCoordsPaste(raw);
    const parsed = parseCoordinates(raw);
    if (parsed) {
      setFormLat(parsed.lat.toString());
      setFormLng(parsed.lng.toString());
      const urls = generateMapUrls(parsed.lat, parsed.lng, formName, formAddress);
      setFormNeshanUrl(urls.neshanUrl);
      setFormBaladUrl(urls.baladUrl);
      setFormGoogleMapUrl(urls.googleMapUrl);
      showToast(`مختصات ${parsed.lat.toFixed(5)} و ${parsed.lng.toFixed(5)} با موفقیت شناسایی و تنظیم شد`);
    }
  };

  // Auto-generate map URLs for manual form
  const handleRegenerateFormMapUrls = () => {
    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    const urls = generateMapUrls(lat, lng, formName.trim(), formAddress.trim());
    setFormNeshanUrl(urls.neshanUrl);
    setFormBaladUrl(urls.baladUrl);
    setFormGoogleMapUrl(urls.googleMapUrl);
    showToast('لینک‌های مسیریابی نشان، بلد و گوگل مپ به‌روزرسانی شدند');
  };

  const handleAddSingleCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('لطفاً نام مرکز را وارد فرمایید');
      return;
    }

    const finalType =
      formType === 'سایر' && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : formType;

    const nextK = Math.max(...allCenters.map((c) => c.k || 0), 140) + 1;
    const streets = [formStreet];
    const latNum = parseFloat(formLat) || URMIA_STREETS_MAP[formStreet]?.lat || 37.545;
    const lngNum = parseFloat(formLng) || URMIA_STREETS_MAP[formStreet]?.lng || 45.07;

    const autoUrls = generateMapUrls(latNum, lngNum, formName.trim(), formAddress.trim());

    const newCenter: MedicalCenter = {
      k: nextK,
      name: formName.trim(),
      id: '',
      address: formAddress.trim() || `ارومیه، خیابان ${formStreet}`,
      phone: formPhone.trim(),
      ownership: 'خصوصی',
      type: finalType,
      phoneWarn: '',
      streets,
      pid: '',
      isNightShift: formIsNightShift,
      specialty: formSpecialty.trim(),
      lat: latNum,
      lng: lngNum,
      neshanUrl: formNeshanUrl.trim() || autoUrls.neshanUrl,
      baladUrl: formBaladUrl.trim() || autoUrls.baladUrl,
      googleMapUrl: formGoogleMapUrl.trim() || autoUrls.googleMapUrl,
      alt: [formName.trim(), formPhone.trim(), finalType, formSpecialty.trim()],
    };

    saveCenterRecord(newCenter);
    showToast(`مرکز «${newCenter.name}» با موفقیت افزوده و ذخیره شد`);

    // Reset form
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormSpecialty('');
    setCustomCategoryInput('');
    setFormIsNightShift(false);
    setCoordsPaste('');
    setFormNeshanUrl('');
    setFormBaladUrl('');
    setFormGoogleMapUrl('');
    reloadData();
    setSubTab('list');
  };

  // --- 4. EDIT CENTER MODAL STATE & LOGIC ---
  const [editingCenter, setEditingCenter] = useState<MedicalCenter | null>(null);
  const [editCoordsPaste, setEditCoordsPaste] = useState('');

  const handleOpenEditModal = (center: MedicalCenter) => {
    setEditingCenter({ ...center });
    setEditCoordsPaste(
      center.lat && center.lng ? `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}` : ''
    );
  };

  const handleApplyEditCoordsPaste = (raw: string) => {
    setEditCoordsPaste(raw);
    const parsed = parseCoordinates(raw);
    if (parsed && editingCenter) {
      const urls = generateMapUrls(parsed.lat, parsed.lng, editingCenter.name, editingCenter.address);
      setEditingCenter({
        ...editingCenter,
        lat: parsed.lat,
        lng: parsed.lng,
        neshanUrl: urls.neshanUrl,
        baladUrl: urls.baladUrl,
        googleMapUrl: urls.googleMapUrl,
      });
      showToast(`مختصات ${parsed.lat.toFixed(5)} و ${parsed.lng.toFixed(5)} تنظیم شد`);
    }
  };

  const handleRegenerateEditMapUrls = () => {
    if (!editingCenter) return;
    const urls = generateMapUrls(
      editingCenter.lat,
      editingCenter.lng,
      editingCenter.name,
      editingCenter.address
    );
    setEditingCenter({
      ...editingCenter,
      neshanUrl: urls.neshanUrl,
      baladUrl: urls.baladUrl,
      googleMapUrl: urls.googleMapUrl,
    });
    showToast('لینک‌های نشان، بلد و گوگل مپ بر اساس مختصات بازسازی شدند');
  };

  const handleSaveEditedCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;

    saveCenterRecord(editingCenter);
    showToast(`تغییرات و دیتای مسیریابی مرکز «${editingCenter.name}» با موفقیت ذخیره شد`);
    setEditingCenter(null);
    reloadData();
  };

  // Revert or delete center
  const handleDeleteOrRevert = (c: MedicalCenter) => {
    const isOverride = Boolean(overridesMap[c.k]);
    const isCustom = customCentersList.some((x) => x.k === c.k);

    const confirmMsg = isOverride
      ? `آیا مایلید تغییرات این مرکز را حذف کرده و به مشخصات اولیه بازگردانید؟`
      : `آیا از حذف مرکز «${c.name}» اطمینان دارید؟`;

    if (!window.confirm(confirmMsg)) return;

    deleteCenterRecord(c.k);
    showToast(isOverride ? 'تغییرات مرکز لغو شد و به حالت اولیه بازگشت' : 'مرکز با موفقیت حذف گردید');
    reloadData();
  };

  // --- 5. EXPORT ALL CENTERS TO EXCEL ---
  const handleExportAllToExcel = () => {
    const exportRows = allCenters.map((c, idx) => ({
      ردیف: idx + 1,
      'کد یکتا': c.k,
      'نام مرکز': c.name,
      'نوع مرکز': c.type,
      'تلفن تماس': c.phone,
      نشانی: c.address,
      'خیابان‌های پوشش': c.streets.join('، '),
      'شبانه‌روزی': c.isNightShift ? 'بله' : 'خیر',
      تخصص: c.specialty || '',
      'عرض جغرافیایی (Lat)': c.lat || '',
      'طول جغرافیایی (Lng)': c.lng || '',
      'لینک نشان': c.neshanUrl || '',
      'لینک بلد': c.baladUrl || '',
      'لینک گوگل مپ': c.googleMapUrl || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'کل مراکز درمانی');
    XLSX.writeFile(wb, `بانک_مراکز_درمانی_کارآفرین_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('فایل اکسل کلیه مراکز درمانی دانلود شد');
  };

  // Copy TypeScript code for permanent developer check-in
  const [copiedCode, setCopiedCode] = useState(false);
  const handleCopyTypeScriptCode = () => {
    const code = `// Updated dataset\nimport { MedicalCenter } from './centers';\nexport const MEDICAL_CENTERS: MedicalCenter[] = ${JSON.stringify(
      allCenters,
      null,
      2
    )};\n`;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      showToast('کد کامل تایپ‌اسکریپت مراکز کپی شد!');
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  // Search and filter for centers list
  const [listSearch, setListSearch] = useState('');
  const [listStreetFilter, setListStreetFilter] = useState('all');
  const [listTypeFilter, setListTypeFilter] = useState('all');
  const [onlyWithGps, setOnlyWithGps] = useState(false);

  const filteredList = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return allCenters.filter((c) => {
      if (listStreetFilter !== 'all' && !c.streets.includes(listStreetFilter)) return false;
      if (listTypeFilter !== 'all' && c.type !== listTypeFilter) return false;
      if (onlyWithGps && (!c.lat || !c.lng || c.lat < 30 || c.lng < 40)) return false;

      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.specialty && c.specialty.toLowerCase().includes(q))
      );
    });
  }, [allCenters, listSearch, listStreetFilter, listTypeFilter, onlyWithGps]);

  // Distinct types & streets for filters
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(allCenters.map((c) => c.type))).filter(Boolean);
  }, [allCenters]);

  const uniqueStreets = useMemo(() => {
    const set = new Set<string>();
    allCenters.forEach((c) => c.streets.forEach((s) => set.add(s)));
    return Array.from(set).filter(Boolean);
  }, [allCenters]);

  const centersWithGpsCount = useMemo(() => {
    return allCenters.filter((c) => c.lat && c.lng && c.lat > 30 && c.lng > 40).length;
  }, [allCenters]);

  return (
    <div className="space-y-6">
      {/* CMS Feature Overview Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-[#0a4c9a] to-emerald-700 text-white p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>پنل اختصاصی مدیریت محتوا و دیتای مسیریابی مراکز کارآفرین</span>
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
              ثبت و ویرایش مشخصات مراکز، <strong>مختصات جغرافیایی (GPS)</strong>، و لینک‌های مسیریابی{' '}
              <strong>نشان</strong>، <strong>بلد</strong> و <strong>گوگل مپ</strong> به صورت پایدار و بلادرنگ در سامانه.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportAllToExcel}
              className="py-2.5 px-3.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
              title="دانلود فایل اکسل کامل همه مراکز به همراه دیتای مسیریابی"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>خروجی اکسل کامل</span>
            </button>

            <button
              onClick={handleCopyTypeScriptCode}
              className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/20 active:scale-95"
              title="کپی سورس کامل کد تایپ‌اسکریپت برای برنامه نویس"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>کپی کد سورس</span>
            </button>
          </div>
        </div>

        {/* Quick GPS Stats Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>کل مراکز در بانک: <strong className="text-white font-extrabold">{toFa(allCenters.length)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
            <Compass className="w-3.5 h-3.5 text-emerald-300" />
            <span>مراکز دارای مختصات GPS: <strong className="text-white font-extrabold">{toFa(centersWithGpsCount)}</strong></span>
          </div>

          {Object.keys(overridesMap).length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-200 px-3 py-1 rounded-xl font-bold">
              <span>{toFa(Object.keys(overridesMap).length)} مرکز با دیتای ویرایش‌شده</span>
            </div>
          )}

          {customCentersList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-200 px-3 py-1 rounded-xl font-bold">
              <span>+{toFa(customCentersList.length)} مرکز جدید افزوده شده</span>
            </div>
          )}
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSubTab('list')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
            subTab === 'list'
              ? 'bg-[#0a4c9a] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>فهرست و ویرایش مراکز ({toFa(allCenters.length)})</span>
        </button>

        <button
          onClick={() => setSubTab('form')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
            subTab === 'form'
              ? 'bg-[#0a4c9a] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>افزودن دستی مرکز جدید (با دیتای مسیریابی)</span>
        </button>

        <button
          onClick={() => setSubTab('excel')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
            subTab === 'excel'
              ? 'bg-[#0a4c9a] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ورود با فایل اکسل (XLSX / CSV)</span>
        </button>

        <button
          onClick={() => setSubTab('text')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
            subTab === 'text'
              ? 'bg-[#0a4c9a] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ورود متنی هوشمند</span>
        </button>
      </div>

      {/* SUBTAB 1: LIST OF ALL CENTERS WITH ROUTING & EDITING */}
      {subTab === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="جستجو در نام مرکز، تخصص، نشانی یا شماره تلفن..."
                className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#0a4c9a]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={listTypeFilter}
                onChange={(e) => setListTypeFilter(e.target.value)}
                className="h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0a4c9a]"
              >
                <option value="all">همه دسته‌ها ({toFa(uniqueTypes.length)})</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={listStreetFilter}
                onChange={(e) => setListStreetFilter(e.target.value)}
                className="h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0a4c9a]"
              >
                <option value="all">همه خیابان‌ها ({toFa(uniqueStreets.length)})</option>
                {uniqueStreets.map((s) => (
                  <option key={s} value={s}>
                    خیابان {s}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-1.5 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyWithGps}
                  onChange={(e) => setOnlyWithGps(e.target.checked)}
                  className="rounded text-[#0a4c9a]"
                />
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>فقط دارای GPS</span>
              </label>

              <button
                onClick={handleExportAllToExcel}
                className="h-10 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>دانلود اکسل ({toFa(allCenters.length)})</span>
              </button>
            </div>
          </div>

          {/* Centers Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center">کد</th>
                  <th className="py-2.5 px-3">نام مرکز درمانی</th>
                  <th className="py-2.5 px-3">نوع مرکز</th>
                  <th className="py-2.5 px-3">خیابان</th>
                  <th className="py-2.5 px-3">تلفن تماس</th>
                  <th className="py-2.5 px-3">دیتای مسیریابی و GPS</th>
                  <th className="py-2.5 px-3 text-center">وضعیت</th>
                  <th className="py-2.5 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredList.map((c) => {
                  const isOverride = Boolean(overridesMap[c.k]);
                  const isCustom = customCentersList.some((x) => x.k === c.k);
                  const hasGps = Boolean(c.lat && c.lng && c.lat > 30 && c.lng > 40);

                  return (
                    <tr key={c.k} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-center">{toFa(c.k)}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        {c.isNightShift && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9.5px] bg-indigo-50 text-indigo-700 font-bold">
                            شبانه‌روزی
                          </span>
                        )}
                        {c.specialty && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {c.specialty}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-50 text-[#0a4c9a] px-2 py-0.5 rounded text-[10.5px] font-bold">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] font-bold">
                        {c.streets.join('، ')}
                      </td>
                      <td className="py-2.5 px-3 dir-ltr text-right text-slate-700 font-bold">
                        {c.phone || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {hasGps ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 font-mono text-[10.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span dir="ltr">
                                {c.lat?.toFixed(5)}, {c.lng?.toFixed(5)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {c.neshanUrl && (
                                <a
                                  href={c.neshanUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                                  title="تست در نشان"
                                >
                                  <span>نشان</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {c.baladUrl && (
                                <a
                                  href={c.baladUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold"
                                  title="تست در بلد"
                                >
                                  <span>بلد</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {c.googleMapUrl && (
                                <a
                                  href={c.googleMapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-700 hover:underline flex items-center gap-0.5 font-bold"
                                  title="تست در گوگل مپ"
                                >
                                  <span>گوگل</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            مختصات ثبت‌نشده (پیش‌فرض خیابان)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isCustom ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            مرکز جدید پنل
                          </span>
                        ) : isOverride ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ویرایش‌شده در پنل
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">اصلی (پیش‌فرض)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0a4c9a] rounded-lg transition"
                            title="ویرایش کامل مشخصات و دیتای مسیریابی"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {(isCustom || isOverride) && (
                            <button
                              onClick={() => handleDeleteOrRevert(c)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              title={isOverride ? 'بازنشانی به حالت اولیه' : 'حذف مرکز'}
                            >
                              {isOverride ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SINGLE CENTER MANUAL FORM */}
      {subTab === 'form' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#0a4c9a]" />
              <span>افزودن دستی مرکز درمانی به همراه دیتای کامل مسیریابی</span>
            </h3>
            <p className="text-xs text-slate-500">
              مشخصات مرکز و مختصات نقشه را در فرم زیر وارد فرمایید تا بلافاصله به بانک اطلاعاتی و مسیریاب‌های نشان، بلد و گوگل مپ اضافه شود.
            </p>
          </div>

          <form onSubmit={handleAddSingleCenter} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نام مرکز درمانی: *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: ساختمان پزشکان صدف"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع مرکز / دسته‌بندی: *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                >
                  <option value="آزمایشگاه">آزمایشگاه</option>
                  <option value="داروخانه">داروخانه</option>
                  <option value="دندانپزشکی">دندانپزشکی</option>
                  <option value="عینک‌سازی">عینک‌سازی / بینایی‌سنجی</option>
                  <option value="تصویربرداری">تصویربرداری و MRI</option>
                  <option value="فیزیوتراپی">فیزیوتراپی</option>
                  <option value="درمانگاه">درمانگاه و پلی‌کلینیک</option>
                  <option value="بیمارستان">بیمارستان</option>
                  <option value="پزشکی هسته‌ای">پزشکی هسته‌ای</option>
                  <option value="متخصص کودکان">متخصص کودکان و اطفال</option>
                  <option value="سایر">سایر (تایپ دسته‌بندی دلخواه...)</option>
                </select>

                {formType === 'سایر' && (
                  <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="block text-amber-900 font-bold mb-1 text-[11px]">
                      عنوان دسته‌بندی دلخواه: *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="مثال: روانپزشکی، شنوایی‌سنجی..."
                      className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg outline-none focus:border-[#0a4c9a] text-xs text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تلفن تماس:</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="مثال: 04433445566"
                  dir="ltr"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a] text-right"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">محدوده / خیابان اصلی در ارومیه:</label>
                <select
                  value={formStreet}
                  onChange={(e) => handleStreetChange(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                >
                  {Object.keys(URMIA_STREETS_MAP).map((st) => (
                    <option key={st} value={st}>
                      خیابان {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">نشانی کامل مرکز:</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="مثال: ارومیه، خیابان خان باباخان، مجتمع صدف، طبقه ۲"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">تخصص یا خدمات ویژه (اختیاری):</label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="مثال: جراحی عمومی و فک و صورت، ارائه تخفیف بیمه تکمیلی"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formIsNightShift}
                    onChange={(e) => setFormIsNightShift(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a4c9a]"
                  />
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">این مرکز شبانه‌روزی (۲۴ ساعته) است</span>
                </label>
              </div>
            </div>

            {/* ROUTING & GPS SECTION */}
            <div className="bg-gradient-to-br from-blue-50/80 via-emerald-50/50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">
                      دیتای مسیریابی، مختصات جغرافیایی (GPS) و لینک‌های نقشه
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      می‌توانید مختصات را مستقیماً پیست کنید یا لینک‌های نقشه را سفارشی‌سازی فرمایید.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegenerateFormMapUrls}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>تولید خودکار لینک‌ها از روی مختصات</span>
                </button>
              </div>

              {/* Paste coordinates field */}
              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-1">
                <label className="block text-slate-800 font-bold text-[11px]">
                  📌 چسباندن سریع مختصات (مانند: <code className="text-blue-700 font-mono">37.547549, 45.066955</code>):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coordsPaste}
                    onChange={(e) => handleCoordsPaste(e.target.value)}
                    placeholder="مختصات کپی شده از نشان، بلد یا گوگل مپ را اینجا پیست کنید..."
                    dir="ltr"
                    className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600 text-right font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCoordsPaste(coordsPaste)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold rounded-lg border border-blue-200 text-xs"
                  >
                    تفکیک و تنظیم
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">عرض جغرافیایی (Latitude / Lat):</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="مثال: 37.547549"
                    dir="ltr"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">طول جغرافیایی (Longitude / Lng):</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="مثال: 45.066955"
                    dir="ltr"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">لینک نقشه نشان (Neshan URL):</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formNeshanUrl}
                      onChange={(e) => setFormNeshanUrl(e.target.value)}
                      placeholder="https://nshn.ir/?lat=...&lng=..."
                      dir="ltr"
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                    />
                    {formNeshanUrl && (
                      <a
                        href={formNeshanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs"
                      >
                        تست
                      </a>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">لینک نقشه بلد (Balad URL):</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formBaladUrl}
                      onChange={(e) => setFormBaladUrl(e.target.value)}
                      placeholder="https://balad.ir/location?latitude=...&longitude=..."
                      dir="ltr"
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                    />
                    {formBaladUrl && (
                      <a
                        href={formBaladUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs"
                      >
                        تست
                      </a>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">لینک گوگل مپ (Google Maps URL):</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formGoogleMapUrl}
                      onChange={(e) => setFormGoogleMapUrl(e.target.value)}
                      placeholder="https://www.google.com/maps/search/?api=1&query=..."
                      dir="ltr"
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                    />
                    {formGoogleMapUrl && (
                      <a
                        href={formGoogleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs"
                      >
                        تست
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-3.5 px-8 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت و ذخیره مرکز جدید با دیتای مسیریابی</span>
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: EXCEL IMPORT */}
      {subTab === 'excel' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>بارگذاری فایل اکسل مراکز درمانی به همراه دیتای مسیریابی</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ستون‌های نام، آدرس، تلفن، نوع مرکز، و همچنین ستون‌های عرض جغرافیایی (Lat) و طول جغرافیایی (Lng) خودکار شناسایی می‌شوند.
              </p>
            </div>

            <button
              onClick={handleDownloadSampleExcel}
              className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>دانلود قالب استاندارد اکسل</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0a4c9a] bg-slate-50/60 hover:bg-blue-50/40 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#0a4c9a]">
              {isExcelUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-800">
                فایل اکسل خود را اینجا بکشید یا برای انتخاب فایل کلیک کنید
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                پشتیبانی از فایل‌های اکسل آفیس (Excel 2007+) و فرمت‌های CSV
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelFileUpload}
              className="hidden"
            />
          </div>

          {/* Preview of Parsed Rows */}
          {excelPreview.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>پیش‌نمایش مراکز خوانده‌شده ({toFa(excelPreview.length)} مرکز):</span>
                </span>
                <button
                  onClick={handleApplyExcelData}
                  className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تأیید و ذخیره همه در برنامه</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">ردیف</th>
                      <th className="py-2.5 px-3">نام مرکز</th>
                      <th className="py-2.5 px-3">نوع مرکز</th>
                      <th className="py-2.5 px-3">تلفن تماس</th>
                      <th className="py-2.5 px-3">نشانی</th>
                      <th className="py-2.5 px-3">مختصات شناسایی‌شده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {excelPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 text-center">{toFa(idx + 1)}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2 px-3">
                          <span className="bg-blue-50 text-[#0a4c9a] px-2 py-0.5 rounded text-[10.5px] font-bold">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 dir-ltr text-right text-slate-700">{item.phone}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{item.address}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-emerald-700">
                          {item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: SMART TEXT PARSER */}
      {subTab === 'text' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0a4c9a]" />
              <span>ورود متنی چندخطی مراکز با تشخیص خودکار مختصات و نقشه</span>
            </h3>
            <p className="text-xs text-slate-500">
              متن دریافتی از نامه‌ها یا گزارش‌ها را در کادر زیر بچسبانید.
              سامانه به طور هوشمند خطوط دارای مختصات جغرافیایی (مانند ۳۷.۵۴۷۵, ۴۵.۰۶۶۹) یا لینک‌های بلد و نشان را شناسایی می‌کند.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">متن مشخصات مراکز:</label>
              <button
                type="button"
                onClick={() => {
                  setTextInput(`ساختمان صدف
نوع مرکز: درمانگاه
نشانی: ارومیه، خیابان خان باباخان، پلاک ۴
تلفن: 04433441234
مختصات: 37.54775073637303, 45.065277945077185

ساختمان پزشکان آتیه
نوع مرکز: فیزیوتراپی و توانبخشی
نشانی: ارومیه، خیابان حسنی، مجتمع آتیه
تلفن: 04433488888
مختصات: 37.5235914363673, 45.064301928836926`);
                }}
                className="text-[#0a4c9a] hover:underline text-[11px] font-bold"
              >
                نمونه متن آزمایشی دارای مختصات
              </button>
            </div>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              placeholder={`نمونه:
ساختمان صدف
نشانی: ارومیه، خیابان خان باباخان
تلفن: 04433441234
مختصات: 37.54775, 45.06527`}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0a4c9a] font-mono leading-relaxed"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleParseText}
              className="py-3 px-6 rounded-xl bg-[#0a4c9a] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>پردازش و استخراج هوشمند اطلاعات و مختصات</span>
            </button>
          </div>

          {/* Text preview */}
          {textPreview.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>مراکز استخراج‌شده ({toFa(textPreview.length)} مرکز):</span>
                </span>
                <button
                  type="button"
                  onClick={handleApplyTextData}
                  className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تأیید و ذخیره در برنامه</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {textPreview.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{item.name}</span>
                      <span className="bg-blue-100 text-[#0a4c9a] px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{item.address}</span>
                    </div>
                    {item.lat && item.lng && (
                      <div className="text-emerald-700 font-mono text-[11px] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>مختصات: {item.lat.toFixed(5)}, {item.lng.toFixed(5)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT CENTER MODAL */}
      {editingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-[#0a4c9a] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm">
                    ویرایش مشخصات و دیتای مسیریابی: {editingCenter.name}
                  </h3>
                  <span className="text-[11px] text-blue-100 font-mono">
                    کد یکتا: #{editingCenter.k}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingCenter(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEditedCenter} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نام مرکز درمانی: *</label>
                  <input
                    type="text"
                    required
                    value={editingCenter.name}
                    onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع مرکز / دسته‌بندی: *</label>
                  <input
                    type="text"
                    required
                    value={editingCenter.type}
                    onChange={(e) => setEditingCenter({ ...editingCenter, type: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">تلفن تماس:</label>
                  <input
                    type="text"
                    value={editingCenter.phone}
                    onChange={(e) => setEditingCenter({ ...editingCenter, phone: e.target.value })}
                    dir="ltr"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a] text-right"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">خیابان‌های پوشش داده شده:</label>
                  <input
                    type="text"
                    value={editingCenter.streets.join('، ')}
                    onChange={(e) =>
                      setEditingCenter({
                        ...editingCenter,
                        streets: e.target.value.split(/[,،]+/).map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="مثال: حسنی، خان باباخان"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">نشانی کامل:</label>
                  <input
                    type="text"
                    value={editingCenter.address}
                    onChange={(e) => setEditingCenter({ ...editingCenter, address: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">تخصص یا خدمات ویژه:</label>
                  <input
                    type="text"
                    value={editingCenter.specialty || ''}
                    onChange={(e) => setEditingCenter({ ...editingCenter, specialty: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0a4c9a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(editingCenter.isNightShift)}
                      onChange={(e) => setEditingCenter({ ...editingCenter, isNightShift: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0a4c9a]"
                    />
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-800">فعالیت شبانه‌روزی (۲۴ ساعته)</span>
                  </label>
                </div>
              </div>

              {/* ROUTING EDIT BOX */}
              <div className="bg-gradient-to-br from-blue-50/80 via-emerald-50/50 to-slate-50 p-4 rounded-2xl border border-blue-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-700" />
                    <span className="font-extrabold text-xs text-slate-900">
                      دیتای مسیریابی و مکان‌یابی دقیق (GPS)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegenerateEditMapUrls}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>تولید مجدد لینک‌های نقشه</span>
                  </button>
                </div>

                {/* Paste coordinates box */}
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                  <label className="block text-slate-800 font-bold text-[10.5px]">
                    📌 چسباندن سریع مختصات (مانند: 37.547549, 45.066955):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editCoordsPaste}
                      onChange={(e) => handleApplyEditCoordsPaste(e.target.value)}
                      placeholder="37.547549, 45.066955"
                      dir="ltr"
                      className="flex-1 h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600 text-right font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyEditCoordsPaste(editCoordsPaste)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold rounded-lg border border-blue-200 text-xs"
                    >
                      اعمال
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">عرض جغرافیایی (Latitude):</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingCenter.lat !== undefined ? editingCenter.lat : ''}
                      onChange={(e) =>
                        setEditingCenter({
                          ...editingCenter,
                          lat: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      dir="ltr"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">طول جغرافیایی (Longitude):</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingCenter.lng !== undefined ? editingCenter.lng : ''}
                      onChange={(e) =>
                        setEditingCenter({
                          ...editingCenter,
                          lng: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      dir="ltr"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">لینک نقشه نشان:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editingCenter.neshanUrl || ''}
                        onChange={(e) => setEditingCenter({ ...editingCenter, neshanUrl: e.target.value })}
                        dir="ltr"
                        className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                      />
                      {editingCenter.neshanUrl && (
                        <a
                          href={editingCenter.neshanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs"
                        >
                          تست
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">لینک نقشه بلد:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editingCenter.baladUrl || ''}
                        onChange={(e) => setEditingCenter({ ...editingCenter, baladUrl: e.target.value })}
                        dir="ltr"
                        className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                      />
                      {editingCenter.baladUrl && (
                        <a
                          href={editingCenter.baladUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs"
                        >
                          تست
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">لینک گوگل مپ:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editingCenter.googleMapUrl || ''}
                        onChange={(e) => setEditingCenter({ ...editingCenter, googleMapUrl: e.target.value })}
                        dir="ltr"
                        className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a4c9a] font-mono text-left text-[11px]"
                      />
                      {editingCenter.googleMapUrl && (
                        <a
                          href={editingCenter.googleMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs"
                        >
                          تست
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCenter(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره تغییرات و دیتای مسیریابی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
