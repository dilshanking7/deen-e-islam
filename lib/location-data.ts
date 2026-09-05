import axios from "axios";

const BASE =
  "https://cdn.jsdelivr.net/gh/dr5hn/countries-states-cities-database@master/json";
const TTL = 7 * 24 * 60 * 60 * 1000;

interface RawCountry {
  id: number;
  name: string;
  iso2: string;
  emoji: string;
  phone_code: string;
}
interface RawState {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
}
interface RawCity {
  id: number;
  name: string;
  state_id: number;
}

async function cachedFetch<T>(url: string, cacheKey: string): Promise<T[]> {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < TTL) return parsed.data as T[];
    }
  } catch {}

  const { data } = await axios.get<T[]>(url, { timeout: 60000 });
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {}
  return data;
}

let countriesCache: RawCountry[] | null = null;

const FALLBACK_COUNTRIES: RawCountry[] = [
  { id: 1, name: "India", iso2: "IN", emoji: "🇮🇳", phone_code: "+91" },
  { id: 2, name: "Pakistan", iso2: "PK", emoji: "🇵🇰", phone_code: "+92" },
  { id: 3, name: "Bangladesh", iso2: "BD", emoji: "🇧🇩", phone_code: "+880" },
  { id: 4, name: "Saudi Arabia", iso2: "SA", emoji: "🇸🇦", phone_code: "+966" },
  { id: 5, name: "United Arab Emirates", iso2: "AE", emoji: "🇦🇪", phone_code: "+971" },
  { id: 6, name: "United States", iso2: "US", emoji: "🇺🇸", phone_code: "+1" },
  { id: 7, name: "United Kingdom", iso2: "GB", emoji: "🇬🇧", phone_code: "+44" },
  { id: 8, name: "Nepal", iso2: "NP", emoji: "🇳🇵", phone_code: "+977" },
  { id: 9, name: "Sri Lanka", iso2: "LK", emoji: "🇱🇰", phone_code: "+94" },
  { id: 10, name: "Afghanistan", iso2: "AF", emoji: "🇦🇫", phone_code: "+93" },
  { id: 11, name: "Turkey", iso2: "TR", emoji: "🇹🇷", phone_code: "+90" },
  { id: 12, name: "Qatar", iso2: "QA", emoji: "🇶🇦", phone_code: "+974" },
  { id: 13, name: "Oman", iso2: "OM", emoji: "🇴🇲", phone_code: "+968" },
  { id: 14, name: "Kuwait", iso2: "KW", emoji: "🇰🇼", phone_code: "+965" },
  { id: 15, name: "Bahrain", iso2: "BH", emoji: "🇧🇭", phone_code: "+973" },
  { id: 16, name: "Malaysia", iso2: "MY", emoji: "🇲🇾", phone_code: "+60" },
  { id: 17, name: "Indonesia", iso2: "ID", emoji: "🇮🇩", phone_code: "+62" },
  { id: 18, name: "Egypt", iso2: "EG", emoji: "🇪🇬", phone_code: "+20" },
  { id: 19, name: "Iraq", iso2: "IQ", emoji: "🇮🇶", phone_code: "+964" },
  { id: 20, name: "Iran", iso2: "IR", emoji: "🇮🇷", phone_code: "+98" },
  { id: 21, name: "Jordan", iso2: "JO", emoji: "🇯🇴", phone_code: "+962" },
  { id: 22, name: "Lebanon", iso2: "LB", emoji: "🇱🇧", phone_code: "+961" },
  { id: 23, name: "Syria", iso2: "SY", emoji: "🇸🇾", phone_code: "+963" },
  { id: 24, name: "Yemen", iso2: "YE", emoji: "🇾🇪", phone_code: "+967" },
  { id: 25, name: "Palestine", iso2: "PS", emoji: "🇵🇸", phone_code: "+970" },
  { id: 26, name: "Tunisia", iso2: "TN", emoji: "🇹🇳", phone_code: "+216" },
  { id: 27, name: "Morocco", iso2: "MA", emoji: "🇲🇦", phone_code: "+212" },
  { id: 28, name: "Algeria", iso2: "DZ", emoji: "🇩🇿", phone_code: "+213" },
  { id: 29, name: "Libya", iso2: "LY", emoji: "🇱🇾", phone_code: "+218" },
  { id: 30, name: "Sudan", iso2: "SD", emoji: "🇸🇩", phone_code: "+249" },
  { id: 31, name: "Somalia", iso2: "SO", emoji: "🇸🇴", phone_code: "+252" },
  { id: 32, name: "Nigeria", iso2: "NG", emoji: "🇳🇬", phone_code: "+234" },
  { id: 33, name: "France", iso2: "FR", emoji: "🇫🇷", phone_code: "+33" },
  { id: 34, name: "Germany", iso2: "DE", emoji: "🇩🇪", phone_code: "+49" },
  { id: 35, name: "Canada", iso2: "CA", emoji: "🇨🇦", phone_code: "+1" },
  { id: 36, name: "Australia", iso2: "AU", emoji: "🇦🇺", phone_code: "+61" },
  { id: 37, name: "Singapore", iso2: "SG", emoji: "🇸🇬", phone_code: "+65" },
  { id: 38, name: "Myanmar", iso2: "MM", emoji: "🇲🇲", phone_code: "+95" },
  { id: 39, name: "Thailand", iso2: "TH", emoji: "🇹🇭", phone_code: "+66" },
  { id: 40, name: "Philippines", iso2: "PH", emoji: "🇵🇭", phone_code: "+63" },
  { id: 41, name: "Russia", iso2: "RU", emoji: "🇷🇺", phone_code: "+7" },
  { id: 42, name: "China", iso2: "CN", emoji: "🇨🇳", phone_code: "+86" },
  { id: 43, name: "Japan", iso2: "JP", emoji: "🇯🇵", phone_code: "+81" },
  { id: 44, name: "Brazil", iso2: "BR", emoji: "🇧🇷", phone_code: "+55" },
  { id: 45, name: "Spain", iso2: "ES", emoji: "🇪🇸", phone_code: "+34" },
  { id: 46, name: "Italy", iso2: "IT", emoji: "🇮🇹", phone_code: "+39" },
  { id: 47, name: "Netherlands", iso2: "NL", emoji: "🇳🇱", phone_code: "+31" },
  { id: 48, name: "Belgium", iso2: "BE", emoji: "🇧🇪", phone_code: "+32" },
  { id: 49, name: "Switzerland", iso2: "CH", emoji: "🇨🇭", phone_code: "+41" },
  { id: 50, name: "Sweden", iso2: "SE", emoji: "🇸🇪", phone_code: "+46" },
  { id: 51, name: "Norway", iso2: "NO", emoji: "🇳🇴", phone_code: "+47" },
  { id: 52, name: "Denmark", iso2: "DK", emoji: "🇩🇰", phone_code: "+45" },
  { id: 53, name: "Poland", iso2: "PL", emoji: "🇵🇱", phone_code: "+48" },
  { id: 54, name: "Ukraine", iso2: "UA", emoji: "🇺🇦", phone_code: "+380" },
  { id: 55, name: "South Africa", iso2: "ZA", emoji: "🇿🇦", phone_code: "+27" },
  { id: 56, name: "Kenya", iso2: "KE", emoji: "🇰🇪", phone_code: "+254" },
  { id: 57, name: "Ethiopia", iso2: "ET", emoji: "🇪🇹", phone_code: "+251" },
  { id: 58, name: "Tanzania", iso2: "TZ", emoji: "🇹🇿", phone_code: "+255" },
  { id: 59, name: "Uganda", iso2: "UG", emoji: "🇺🇬", phone_code: "+256" },
  { id: 60, name: "Ghana", iso2: "GH", emoji: "🇬🇭", phone_code: "+233" },
  { id: 61, name: "Senegal", iso2: "SN", emoji: "🇸🇳", phone_code: "+221" },
  { id: 62, name: "Uzbekistan", iso2: "UZ", emoji: "🇺🇿", phone_code: "+998" },
  { id: 63, name: "Kazakhstan", iso2: "KZ", emoji: "🇰🇿", phone_code: "+7" },
  { id: 64, name: "Azerbaijan", iso2: "AZ", emoji: "🇦🇿", phone_code: "+994" },
  { id: 65, name: "Fiji", iso2: "FJ", emoji: "🇫🇯", phone_code: "+679" },
];

export async function getCountries(force = false): Promise<RawCountry[]> {
  if (countriesCache && !force) return countriesCache;
  try {
    const list = await cachedFetch<RawCountry>(`${BASE}/countries.json`, "loc-countries");
    list.sort((a, b) => a.name.localeCompare(b.name));
    countriesCache = list;
    return list;
  } catch {
    const list = [...FALLBACK_COUNTRIES];
    list.sort((a, b) => a.name.localeCompare(b.name));
    countriesCache = list;
    return list;
  }
}

export async function getStates(countryIso2: string): Promise<RawState[]> {
  const all = await cachedFetch<RawState>(`${BASE}/states.json`, "loc-states");
  return all.filter((s) => s.country_code === countryIso2);
}

export async function getCities(stateId: number): Promise<RawCity[]> {
  const all = await cachedFetch<RawCity>(`${BASE}/cities.json`, "loc-cities");
  return all.filter((c) => c.state_id === stateId);
}

export const INDIA_DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Nellore","Prakasam","Srikakulam","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa","Palnadu","NTR","Bapatla","Sri Sathya Sai","Anakapalli","Alluri Sitharama Raju","Kakinada","Konaseema","Eluru","Tirupati"],
  "Arunachal Pradesh": ["Tawang","West Kameng","East Kameng","Papum Pare","Kurung Kumey","Kra Daadi","Lower Subansiri","Upper Subansiri","West Siang","East Siang","Siang","Upper Siang","Lower Siang","Lohit","Namsai","Changlang","Tirap","Longding","Anjaw","Dibang Valley","Lower Dibang Valley","Kamle","Lepa Rada","Pakke Kessang","Shi Yomi","Itanagar"],
  "Assam": ["Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","South Salmara Mankachar","Tinsukia","Udalguri","West Karbi Anglong"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Gaurela Pendra Marwahi","Janjgir Champa","Jashpur","Kabirdham","Kanker","Kondagaon","Korba","Korea","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja","Mohla Manpur","Sakti","Khairagarh","Manendragarh","Sarangarh Bilaigarh","Shakti"],
  "Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela Kharsawan","Simdega","West Singhbhum"],
  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davangere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Niwari","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahilyanagar","Akola","Amravati","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Saitual","Serchhip"],
  "Nagaland": ["Chumoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Niuland","Noklak","Peren","Phek","Shamator","Tseminyu","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Muktsar","Pathankot","Patiala","Rupnagar","Sangrur","SAS Nagar","Shahid Bhagat Singh Nagar","Sri Muktsar Sahib","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Ganganagar","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Tonk","Udaipur"],
  "Sikkim": ["East Sikkim","North Sikkim","South Sikkim","West Sikkim"],
  "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hanumakonda","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Komaram Bheem","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttar Pradesh": ["Agra","Aligarh","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya","Azamgarh","Bagpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kushinagar","Lakhimpur Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Prayagraj","Raebareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
};

export const INDIA_STATES: Record<string, string[]> = {
  India: Object.keys(INDIA_DISTRICTS),
};

export function getDistricts(state: string): string[] {
  return INDIA_DISTRICTS[state] || [];
}
