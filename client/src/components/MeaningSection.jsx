import DefinitionCard from './DefinitionCard.jsx';

/**
 * Groups definitions by part of speech and animates each card in sequence.
 */
export default function MeaningSection({ entry, limit }) {
  if (!entry?.meanings?.length) return null;

  const meanings = typeof limit === 'number' ? entry.meanings.slice(0, limit) : entry.meanings;
  let counter = 0;

  return (
    <div className="meanings">
      {meanings.map((meaning) => {
        const defs = meaning.definitions || [];
        const firstIndex = counter + 1;
        counter += defs.length;

        return (
          <section className="meaning-block" key={`${meaning.partOfSpeech}-${firstIndex}`}>
            <h3 className="pos-heading">
              <span>{meaning.partOfSpeech}</span>
              <span className="pos-count">
                {defs.length} definition{defs.length === 1 ? '' : 's'}
              </span>
            </h3>

            <div className="def-list stagger">
              {defs.map((def, index) => (
                <DefinitionCard
                  key={`${meaning.partOfSpeech}-${index}`}
                  index={firstIndex + index}
                  partOfSpeech={meaning.partOfSpeech}
                  definition={def.definition}
                  example={def.example}
                  delay={Math.min(index, 7) * 55}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
