# react-feed

```tsx
const [startIndex, setStartIndex] = useState(0);

<Feed
  startIndex={startIndex}
  onReadHeight={(el) => el.offsetHeight}
  onReadScrollTop={() => document.scrollingElement.scrollTop}
  onChangeStartIndex={setStartIndex}
>
  {items.slice(startIndex, startIndex + 10).map((item) => (
    <Card key={item.id} />
  ))}
</Feed>
```
