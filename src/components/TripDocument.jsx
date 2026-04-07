import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const C = {
  bg: '#0a0f1e',
  surface: '#111827',
  teal: '#14b8a6',
  amber: '#f59e0b',
  white: '#f1f5f9',
  muted: '#94a3b8',
  food: '#f59e0b',
  border: '#1e293b',
};

const DAY_COLORS = ['#14b8a6','#f59e0b','#8b5cf6','#ec4899','#22c55e','#3b82f6','#f97316'];

const s = StyleSheet.create({
  page: { backgroundColor: C.bg, padding: 40, fontFamily: 'Helvetica' },
  coverPage: { backgroundColor: C.bg, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' },
  tag: { backgroundColor: C.teal, color: '#fff', fontSize: 9, padding: '3 8', borderRadius: 4, marginBottom: 12, alignSelf: 'flex-start' },
  title: { color: C.white, fontSize: 36, fontFamily: 'Helvetica-Bold', marginBottom: 8, lineHeight: 1.2 },
  subtitle: { color: C.muted, fontSize: 13, marginBottom: 32 },
  divider: { borderBottom: `1 solid ${C.border}`, marginVertical: 20 },
  sectionLabel: { color: C.muted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  focusBadge: { backgroundColor: C.teal, color: '#fff', fontSize: 10, padding: '4 10', borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  accomBox: { backgroundColor: C.surface, borderRadius: 8, padding: 16, marginTop: 12 },
  accomName: { color: C.teal, fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  accomWhy: { color: C.muted, fontSize: 10, lineHeight: 1.5 },

  dayPage: { backgroundColor: C.bg, padding: 40 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dayBadge: { color: '#fff', fontSize: 11, fontFamily: 'Helvetica-Bold', padding: '4 12', borderRadius: 20, marginRight: 12 },
  dayTitle: { color: C.white, fontSize: 20, fontFamily: 'Helvetica-Bold' },

  placeRow: { flexDirection: 'row', marginBottom: 14, paddingBottom: 14, borderBottom: `1 solid ${C.border}` },
  placeNum: { color: C.muted, fontSize: 10, width: 22, paddingTop: 2 },
  placeBody: { flex: 1 },
  placeName: { color: C.white, fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  placeMeta: { flexDirection: 'row', gap: 8, marginBottom: 5, flexWrap: 'wrap' },
  placeTag: { fontSize: 8, padding: '2 6', borderRadius: 10 },
  placeDesc: { color: C.muted, fontSize: 9, lineHeight: 1.5 },
  foodNotes: { color: '#fcd34d', fontSize: 9, marginTop: 3 },
});

function formatDuration(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function PlaceRow({ place, index, dayColor }) {
  const isFood = place.category === 'food';
  const tagBg = isFood ? '#92400e' : place.category === 'must-see' ? '#1e3a5f' : '#1e293b';
  const tagColor = isFood ? C.amber : place.category === 'must-see' ? '#93c5fd' : C.muted;
  const label = isFood ? `🍽 ${place.cuisine || 'Restaurant'}` : place.category === 'must-see' ? '★ Must-see' : 'Optional';

  return (
    <View style={s.placeRow}>
      <Text style={s.placeNum}>{index + 1}.</Text>
      <View style={s.placeBody}>
        <Text style={s.placeName}>{place.name}</Text>
        <View style={s.placeMeta}>
          <Text style={[s.placeTag, { backgroundColor: tagBg, color: tagColor }]}>{label}</Text>
          {place.durationMinutes ? (
            <Text style={[s.placeTag, { backgroundColor: '#1e293b', color: C.muted }]}>
              ⏱ {formatDuration(place.durationMinutes)}
            </Text>
          ) : null}
        </View>
        {place.description ? <Text style={s.placeDesc}>{place.description}</Text> : null}
        {isFood && place.notes ? <Text style={s.foodNotes}>{place.notes}</Text> : null}
      </View>
    </View>
  );
}

function DayPage({ places, dayNum, color }) {
  const sorted = [...places].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <Page size="A4" style={s.dayPage}>
      <View style={s.dayHeader}>
        <Text style={[s.dayBadge, { backgroundColor: color }]}>Day {dayNum}</Text>
        <Text style={s.dayTitle}>{sorted.length} stops</Text>
      </View>
      {sorted.map((p, i) => (
        <PlaceRow key={p.id} place={p} index={i} dayColor={color} />
      ))}
    </Page>
  );
}

export default function TripDocument({ trip }) {
  const numDays = trip.numDays || 1;
  const focus = trip.focus || 'balanced';
  const neighbourhoods = trip.accommodation?.neighbourhoods || [];

  const days = [];
  for (let d = 1; d <= numDays; d++) {
    days.push(trip.places?.filter(p => p.day === d) || []);
  }

  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={s.coverPage}>
        <Text style={s.tag}>TRAVEL ITINERARY</Text>
        <Text style={s.title}>{trip.name || trip.destination}</Text>
        <Text style={s.subtitle}>
          {trip.destination} · {numDays} {numDays === 1 ? 'day' : 'days'} · {trip.startTime || '09:00'}–{trip.endTime || '21:00'}
        </Text>

        <View style={s.divider} />

        <Text style={s.sectionLabel}>Focus</Text>
        <Text style={s.focusBadge}>{focus.charAt(0).toUpperCase() + focus.slice(1)}</Text>

        {neighbourhoods.length > 0 && (
          <View>
            <View style={s.divider} />
            <Text style={s.sectionLabel}>Suggested accommodation areas</Text>
            {neighbourhoods.map((n, i) => (
              <View key={i} style={s.accomBox}>
                <Text style={s.accomName}>{n.name}</Text>
                <Text style={s.accomWhy}>{n.why}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.divider} />
        <Text style={s.sectionLabel}>Total places</Text>
        <Text style={{ color: C.white, fontSize: 24, fontFamily: 'Helvetica-Bold' }}>
          {trip.places?.length || 0}
        </Text>
      </Page>

      {/* One page per day */}
      {days.map((places, i) => (
        <DayPage
          key={i}
          places={places}
          dayNum={i + 1}
          color={DAY_COLORS[i % DAY_COLORS.length]}
        />
      ))}
    </Document>
  );
}
