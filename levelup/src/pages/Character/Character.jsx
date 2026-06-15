import { useState } from 'react'
import { Sword, Shield as ShieldIcon, Sparkles, Package } from 'lucide-react'
import toast from 'react-hot-toast'

import { useCharacter } from '../../hooks/useCharacter'
import { setItemEquipped } from '../../services/itemService'
import { updateCharacter } from '../../services/characterService'
import { useCharacterStore } from '../../stores/characterStore'
import { CLASS_TYPES, STAT_LABELS } from '../../utils/constants'

import Header from '../../components/layout/Header/Header'
import Card from '../../components/ui/Card/Card'
import ProgressBar from '../../components/ui/ProgressBar/ProgressBar'
import Badge from '../../components/ui/Badge/Badge'
import Spinner from '../../components/ui/Spinner/Spinner'
import EmptyState from '../../components/ui/EmptyState/EmptyState'

import styles from './Character.module.css'

const STAT_ICONS = {
  strength: Sword,
  agility: Sparkles,
  intelligence: ShieldIcon,
}

const RARITY_VARIANT = {
  common: 'neutral',
  uncommon: 'info',
  rare: 'xp',
  epic: 'success',
  legendary: 'warning',
}

const RARITY_LABELS = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
}

const APPLICABLE_STATS = ['strength', 'agility', 'intelligence']

export default function Character() {
  const { character, loading, items, itemsLoading, fetchItems } = useCharacter({ autoLoad: false })
  const setCharacter = useCharacterStore((s) => s.setCharacter)

  async function handleToggleEquip(characterItem) {
    const item = characterItem.item
    if (!item || !character) return

    const equipping = !characterItem.equipped

    // Block equipping if another item of the same type is already equipped
    if (equipping) {
      const alreadyEquipped = items.find(
        (ci) => ci.id !== characterItem.id && ci.equipped && ci.item?.type === item.type
      )
      if (alreadyEquipped) {
        toast.error(`Já tens um item do tipo "${item.type}" equipado. Desequipa-o primeiro.`)
        return
      }
    }

    const statDeltas = {}
    if (item.stat_bonus) {
      Object.entries(item.stat_bonus).forEach(([stat, val]) => {
        if (APPLICABLE_STATS.includes(stat)) {
          statDeltas[stat] = equipping ? val : -val
        }
      })
    }

    try {
      await setItemEquipped({ characterItemId: characterItem.id, equipped: equipping })

      if (Object.keys(statDeltas).length > 0) {
        const updates = {}
        Object.entries(statDeltas).forEach(([stat, delta]) => {
          updates[stat] = (character[stat] ?? 0) + delta
        })
        const updated = await updateCharacter(character.id, updates)
        setCharacter(updated)
      }

      await fetchItems(character.id)
      toast.success(equipping ? `${item.name} equipado!` : `${item.name} desequipado.`)
    } catch (err) {
      toast.error('Erro ao equipar item.')
      console.error(err)
    }
  }

  if (loading || !character) {
    return (
      <>
        <Header title="Personagem" />
        <Spinner fullScreen={false} />
      </>
    )
  }

  const classDef = CLASS_TYPES[character.class_type] ?? CLASS_TYPES.paladin

  return (
    <>
      <Header title="Personagem" />
      <div className={styles.page}>
        <Card className={styles.hero} glow>
          <div className={styles.heroIcon} aria-hidden="true">
            {classDef.icon}
          </div>
          <h2 className={styles.heroName}>{character.name}</h2>
          <p className={styles.heroSubtitle}>
            {classDef.name} · Nível {character.level}
          </p>
          <div className={styles.xpBlock}>
            <div className={styles.xpLabels}>
              <span className={styles.xpLabel}>Experiência</span>
              <span className={styles.xpValue}>
                {character.xp} / {character.xp_to_next_level} XP
              </span>
            </div>
            <ProgressBar
              current={character.xp}
              max={character.xp_to_next_level}
              variant="primary"
              height={12}
            />
          </div>
        </Card>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Atributos</h3>
          <div className={styles.statsGrid}>
            {['strength', 'agility', 'intelligence'].map((stat) => {
              const Icon = STAT_ICONS[stat]
              return (
                <Card key={stat} className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Icon size={22} />
                  </div>
                  <div className={styles.statBody}>
                    <span className={styles.statName}>{STAT_LABELS[stat]}</span>
                    <span className={styles.statValue}>{character[stat]}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Equipamento</h3>
            {items.length > 0 && (
              <Badge variant="neutral">{items.length} {items.length === 1 ? 'item' : 'itens'}</Badge>
            )}
          </header>

          {itemsLoading ? (
            <Spinner fullScreen={false} />
          ) : items.length === 0 ? (
            <Card className={styles.equipmentCard}>
              <EmptyState
                icon={<ShieldIcon size={36} />}
                title="Sem equipamento"
                description="Completa missões para ganhares itens e equipá-los."
              />
            </Card>
          ) : (
            <div className={styles.itemsGrid}>
              {items.map((ci) => (
                <ItemCard
                  key={ci.id}
                  characterItem={ci}
                  onToggleEquip={handleToggleEquip}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function ItemCard({ characterItem, onToggleEquip }) {
  const [busy, setBusy] = useState(false)
  const item = characterItem.item
  if (!item) return null

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      await onToggleEquip(characterItem)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      className={`${styles.itemCard} ${characterItem.equipped ? styles.itemEquipped : ''}`}
      onClick={handleClick}
      hoverable
    >
      <div className={styles.itemIcon}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className={styles.itemImage} />
        ) : (
          <Package size={28} />
        )}
      </div>
      <div className={styles.itemBody}>
        <span className={styles.itemName}>{item.name}</span>
        {item.rarity && (
          <Badge variant={RARITY_VARIANT[item.rarity] ?? 'neutral'} className={styles.itemRarity}>
            {RARITY_LABELS[item.rarity] ?? item.rarity}
          </Badge>
        )}
        {item.description && (
          <p className={styles.itemDescription}>{item.description}</p>
        )}
        {item.stat_bonus && Object.keys(item.stat_bonus).length > 0 && (
          <div className={styles.itemStats}>
            {Object.entries(item.stat_bonus).map(([stat, val]) => (
              <span key={stat} className={styles.itemStat}>
                +{val} {STAT_LABELS[stat] ?? stat}
              </span>
            ))}
          </div>
        )}
      </div>
      {characterItem.equipped && (
        <Badge variant="success" className={styles.equippedBadge}>Equipado</Badge>
      )}
    </Card>
  )
}
