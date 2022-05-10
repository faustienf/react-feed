# react-feed
<p align="center">
  <img src="https://raw.githubusercontent.com/faustienf/react-feed/master/public/picture.png" width="500">
</p>

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
