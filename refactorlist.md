# refactor outline

convert between cellId buffer and string throughout the code



Pegah 
1. implenment scss - done
2. develop a clear understanding of how css variables will be used (and document if we can)
3. convert all css files to scss - done

css notes: 
- lots of duplications due to vanilla css and lack of nesting
- lots of overriding happening for some components using generic compenent templates
- need to switch to rem instead of pixel, as the screen resolution impacts its
- inconcistency between using _ (olrder class names) and - (newer claass names)
- colors dont have names so its difficult to assign a recurring color to a class name
- screen size related classes (and beak pints) are inefficient
- need to get rid of commented out lines

"According to the guideline, here are some common properties that will benefit from variables:

    border-radius
    color
    font-family
    font-weight
    margin (gutters, grid gutters)
    transition (duration, easing) – consider a mixin*
    * https://www.koderhq.com/tutorial/sass/mixin/#what-is"



- decide which component stylings we are keeping
